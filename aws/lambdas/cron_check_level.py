"""EventBridge Cron — 레벨 변화 감지 후 Push 알림 발송"""

import json
import os
import asyncio
import redis as redis_lib
from shared import fetch_all

try:
    from pywebpush import webpush, WebPushException
except ImportError:
    webpush = None
    WebPushException = Exception

REDIS_URL = os.environ.get("REDIS_URL", "")
VAPID_PRIVATE_KEY = os.environ.get("VAPID_PRIVATE_KEY", "")
VAPID_SUBJECT = os.environ.get("VAPID_SUBJECT", "mailto:admin@tacotrump.space")

PUSH_SUBS_KEY = "push_subs"
LAST_LEVEL_KEY = "push_last_level"

LEVEL_LABELS = {
    1: {"ko": "안전", "en": "Safe"},
    2: {"ko": "주의", "en": "Caution"},
    3: {"ko": "경고", "en": "Warning"},
    4: {"ko": "위험", "en": "Danger"},
}


def get_redis():
    return redis_lib.from_url(REDIS_URL, decode_responses=True)


def send_push(sub_json: str, payload: dict):
    if not webpush:
        return None
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
        if hasattr(e, 'response') and e.response and e.response.status_code == 410:
            return sub_json
        return None
    except Exception:
        return None


def handler(event, context):
    """EventBridge에서 호출됨 — HTTP 응답 불필요"""
    try:
        r = get_redis()

        _data, _total, risk = asyncio.run(fetch_all())
        current_level = risk["level"]

        prev_raw = r.get(LAST_LEVEL_KEY)
        prev_level = int(prev_raw) if prev_raw else None

        sent = 0
        if prev_level is not None and current_level != prev_level:
            subs = r.smembers(PUSH_SUBS_KEY) or set()
            label = LEVEL_LABELS.get(current_level, {"ko": "", "en": ""})
            payload = {
                "title": {
                    "ko": f"타코 레벨 변경! Lv.{current_level} {label['ko']}",
                    "en": f"TACO Level Changed! Lv.{current_level} {label['en']}",
                },
                "body": {
                    "ko": f"Lv.{prev_level} → Lv.{current_level} 으로 변경되었습니다.",
                    "en": f"Changed from Lv.{prev_level} to Lv.{current_level}.",
                },
            }

            expired = []
            for sub_str in subs:
                result = send_push(sub_str, payload)
                if result:
                    expired.append(result)
                else:
                    sent += 1

            for exp in expired:
                r.srem(PUSH_SUBS_KEY, exp)

        r.set(LAST_LEVEL_KEY, str(current_level))

        return {
            "level": current_level,
            "prev_level": prev_level,
            "changed": prev_level is not None and current_level != prev_level,
            "sent": sent,
        }
    except Exception as e:
        return {"error": str(e)}
