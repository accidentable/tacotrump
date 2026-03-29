"""Vercel Cron Job — 5분마다 레벨 변화 감지 후 Push 알림 발송"""

import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from http.server import BaseHTTPRequestHandler
import json
import asyncio
import redis as redis_lib
from pywebpush import webpush, WebPushException
from _shared import fetch_all

REDIS_URL = os.environ.get("REDIS_URL", "")
VAPID_PRIVATE_KEY = os.environ.get("VAPID_PRIVATE_KEY", "")
VAPID_SUBJECT = os.environ.get("VAPID_SUBJECT", "mailto:admin@tacotrump.space")
CRON_SECRET = os.environ.get("CRON_SECRET", "")

PUSH_SUBS_KEY = "push_subs"
LAST_LEVEL_KEY = "push_last_level"

LEVEL_LABELS = {1: "안전", 2: "주의", 3: "경고", 4: "위험"}


def get_redis():
    return redis_lib.from_url(REDIS_URL, decode_responses=True)


def send_push(sub_json: str, payload: dict):
    """단일 구독에 push 발송. 410이면 삭제 대상 반환."""
    try:
        sub = json.loads(sub_json)
        webpush(
            subscription_info=sub,
            data=json.dumps(payload, ensure_ascii=False),
            vapid_private_key=VAPID_PRIVATE_KEY,
            vapid_claims={"sub": VAPID_SUBJECT},
        )
        return None
    except WebPushException as e:
        if e.response and e.response.status_code == 410:
            return sub_json  # expired subscription
        return None
    except Exception:
        return None


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # Verify CRON_SECRET
        if CRON_SECRET:
            auth = self.headers.get("Authorization", "")
            if auth != f"Bearer {CRON_SECRET}":
                self.send_response(401)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Unauthorized"}).encode())
                return

        try:
            r = get_redis()

            # 1) 현재 레벨 계산
            _data, _total, risk = asyncio.run(fetch_all())
            current_level = risk["level"]

            # 2) 이전 레벨 조회
            prev_raw = r.get(LAST_LEVEL_KEY)
            prev_level = int(prev_raw) if prev_raw else None

            # 3) 레벨 변경 시 push 발송
            sent = 0
            if prev_level is not None and current_level != prev_level:
                subs = r.smembers(PUSH_SUBS_KEY) or set()
                payload = {
                    "title": f"타코 레벨 변경! Lv.{current_level} {LEVEL_LABELS.get(current_level, '')}",
                    "body": f"Lv.{prev_level} → Lv.{current_level} 으로 변경되었습니다.",
                }

                expired = []
                for sub_str in subs:
                    result = send_push(sub_str, payload)
                    if result:
                        expired.append(result)
                    else:
                        sent += 1

                # 만료된 구독 제거
                for exp in expired:
                    r.srem(PUSH_SUBS_KEY, exp)

            # 4) 현재 레벨 저장
            r.set(LAST_LEVEL_KEY, str(current_level))

            body = json.dumps({
                "level": current_level,
                "prev_level": prev_level,
                "changed": prev_level is not None and current_level != prev_level,
                "sent": sent,
            })

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(body.encode())
        except Exception:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": "Internal server error"}).encode())
