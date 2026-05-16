"""API Key 인증 및 Rate Limiting — Redis 기반 (Lambda용)"""

import hashlib
import json
import os
import secrets
from datetime import datetime, timezone, timedelta

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
DAILY_LIMIT = 1000


def _hash_key(api_key: str) -> str:
    return hashlib.sha256(api_key.encode()).hexdigest()


def generate_api_key(email: str, app_name: str = "") -> dict:
    r = get_redis()
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
    r.expire(usage_key, 86400 * 2)

    return True, limit - current - 1, limit


def get_keys_for_email(email: str) -> list[dict]:
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
    r = get_redis()
    key_hash = _hash_key(api_key)
    raw = r.get(f"apikey:{key_hash}")
    if not raw:
        return False

    meta = json.loads(raw)
    meta["active"] = False
    r.set(f"apikey:{key_hash}", json.dumps(meta))
    return True


# ── Lambda 헬퍼 ──────────────────────────────────────────────

def require_api_key(event) -> dict | None:
    """API 키 검증 + Rate Limit. 실패 시 에러 응답 dict 반환, 성공 시 meta 반환."""
    from lambda_utils import get_header, get_query_params

    api_key = get_header(event, "x-api-key")

    if not api_key:
        params = get_query_params(event)
        api_key = params.get("api_key", "")

    if not api_key:
        return {"_error": True, "status": 401,
                "body": {"error": "API key required. Pass via X-API-Key header or api_key query parameter."}}

    meta = validate_api_key(api_key)
    if not meta:
        return {"_error": True, "status": 403,
                "body": {"error": "Invalid or revoked API key."}}

    allowed, remaining, limit = check_rate_limit(api_key)
    if not allowed:
        return {"_error": True, "status": 429,
                "body": {"error": "Rate limit exceeded.", "daily_limit": limit}}

    meta["_remaining"] = remaining
    meta["_limit"] = limit
    return meta
