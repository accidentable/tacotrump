"""API Key 인증 및 Rate Limiting — Redis 기반"""

import hashlib
import json
import os
import secrets
from datetime import datetime, timezone, timedelta
from urllib.parse import urlparse, parse_qs

import redis

KST = timezone(timedelta(hours=9))

# ── Redis 연결 ────────────────────────────────────────────────

_redis_client = None


def get_redis():
    global _redis_client
    if _redis_client is None:
        url = os.getenv("REDIS_URL", "")
        if not url:
            raise RuntimeError("REDIS_URL not configured")
        _redis_client = redis.from_url(url, decode_responses=True)
    return _redis_client


# ── API Key 생성/관리 ─────────────────────────────────────────

PREFIX = "taco_"
DAILY_LIMIT = 1000  # 일일 요청 한도


def _hash_key(api_key: str) -> str:
    return hashlib.sha256(api_key.encode()).hexdigest()


def generate_api_key(email: str, app_name: str = "") -> dict:
    """새 API 키 발급"""
    r = get_redis()

    # 이메일당 최대 3개
    existing = r.smembers(f"apikeys:email:{email}")
    if len(existing) >= 3:
        return {"error": "이메일당 최대 3개의 API 키만 발급 가능합니다."}

    raw_key = PREFIX + secrets.token_hex(24)
    key_hash = _hash_key(raw_key)
    now = datetime.now(KST).isoformat()

    meta = {
        "email": email,
        "app_name": app_name,
        "created_at": now,
        "active": True,
        "daily_limit": DAILY_LIMIT,
    }

    r.set(f"apikey:{key_hash}", json.dumps(meta))
    r.sadd(f"apikeys:email:{email}", key_hash)

    return {
        "api_key": raw_key,
        "email": email,
        "app_name": app_name,
        "created_at": now,
        "daily_limit": DAILY_LIMIT,
    }


def validate_api_key(api_key: str) -> dict | None:
    """API 키 검증. 유효하면 메타데이터 반환, 아니면 None."""
    if not api_key or not api_key.startswith(PREFIX):
        return None

    r = get_redis()
    key_hash = _hash_key(api_key)
    raw = r.get(f"apikey:{key_hash}")
    if not raw:
        return None

    meta = json.loads(raw)
    if not meta.get("active", False):
        return None

    return meta


def check_rate_limit(api_key: str) -> tuple[bool, int, int]:
    """Rate limit 체크. (allowed, remaining, limit) 반환."""
    r = get_redis()
    key_hash = _hash_key(api_key)
    meta_raw = r.get(f"apikey:{key_hash}")
    if not meta_raw:
        return False, 0, 0

    meta = json.loads(meta_raw)
    limit = meta.get("daily_limit", DAILY_LIMIT)
    today = datetime.now(KST).strftime("%Y-%m-%d")
    usage_key = f"apikey:usage:{key_hash}:{today}"

    current = int(r.get(usage_key) or 0)
    if current >= limit:
        return False, 0, limit

    r.incr(usage_key)
    r.expire(usage_key, 86400 * 2)  # 2일 후 자동 삭제

    return True, limit - current - 1, limit


def get_keys_for_email(email: str) -> list[dict]:
    """이메일로 발급된 키 목록 조회 (키 값은 마스킹)"""
    r = get_redis()
    hashes = r.smembers(f"apikeys:email:{email}")
    keys = []
    for h in hashes:
        raw = r.get(f"apikey:{h}")
        if not raw:
            continue
        meta = json.loads(raw)
        today = datetime.now(KST).strftime("%Y-%m-%d")
        usage = int(r.get(f"apikey:usage:{h}:{today}") or 0)
        keys.append({
            "key_hash": h[:12] + "...",
            "app_name": meta.get("app_name", ""),
            "created_at": meta.get("created_at", ""),
            "active": meta.get("active", False),
            "daily_limit": meta.get("daily_limit", DAILY_LIMIT),
            "today_usage": usage,
        })
    return keys


def revoke_api_key(api_key: str) -> bool:
    """API 키 비활성화"""
    r = get_redis()
    key_hash = _hash_key(api_key)
    raw = r.get(f"apikey:{key_hash}")
    if not raw:
        return False

    meta = json.loads(raw)
    meta["active"] = False
    r.set(f"apikey:{key_hash}", json.dumps(meta))
    return True


# ── 핸들러 헬퍼 ───────────────────────────────────────────────

def send_json(handler, data, status=200, cache=None):
    """JSON 응답 전송"""
    body = json.dumps(data, ensure_ascii=False)
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type, X-API-Key")
    if cache:
        handler.send_header("Cache-Control", cache)
    handler.end_headers()
    handler.wfile.write(body.encode())


def send_cors_preflight(handler):
    """OPTIONS 프리플라이트 응답"""
    handler.send_response(204)
    handler.send_header("Access-Control-Allow-Origin", "*")
    handler.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
    handler.send_header("Access-Control-Allow-Headers", "Content-Type, X-API-Key")
    handler.send_header("Access-Control-Max-Age", "86400")
    handler.end_headers()


def require_api_key(handler) -> dict | None:
    """API 키 검증 + Rate Limit. 실패 시 에러 응답 전송 후 None 반환."""
    api_key = handler.headers.get("X-API-Key", "")

    # 쿼리 파라미터에서도 허용
    if not api_key:
        qs = parse_qs(urlparse(handler.path).query)
        api_key = qs.get("api_key", [""])[0]

    if not api_key:
        send_json(handler, {"error": "API key required. Pass via X-API-Key header or api_key query parameter."}, 401)
        return None

    meta = validate_api_key(api_key)
    if not meta:
        send_json(handler, {"error": "Invalid or revoked API key."}, 403)
        return None

    allowed, remaining, limit = check_rate_limit(api_key)
    if not allowed:
        send_json(handler, {"error": "Rate limit exceeded.", "daily_limit": limit}, 429)
        return None

    # Rate limit 헤더 추가용
    meta["_remaining"] = remaining
    meta["_limit"] = limit
    return meta
