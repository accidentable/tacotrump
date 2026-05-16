"""POST/DELETE /api/push-subscribe — Web Push 구독 관리 (Redis)"""

import json
import os
import redis
from lambda_utils import (
    response, error_response, options_response,
    get_origin, get_method, get_body,
)

REDIS_URL = os.environ.get("REDIS_URL", "")
PUSH_SUBS_KEY = "push_subs"

METHODS = "POST, DELETE, OPTIONS"


def get_redis():
    return redis.from_url(REDIS_URL, decode_responses=True)


def _validate_subscription(sub):
    if not isinstance(sub, dict):
        return False
    if not sub.get("endpoint"):
        return False
    keys = sub.get("keys", {})
    if not isinstance(keys, dict):
        return False
    if not keys.get("p256dh") or not keys.get("auth"):
        return False
    return True


def handler(event, context):
    origin = get_origin(event)
    method = get_method(event)

    if method == "OPTIONS":
        return options_response(origin, METHODS)

    try:
        sub = get_body(event)

        if method == "POST":
            if not _validate_subscription(sub):
                return error_response(400, "Invalid subscription format", origin)

            sub_str = json.dumps(sub, sort_keys=True)
            r = get_redis()
            r.sadd(PUSH_SUBS_KEY, sub_str)
            return response(200, {"ok": True}, origin, methods=METHODS)

        elif method == "DELETE":
            sub_str = json.dumps(sub, sort_keys=True)
            r = get_redis()
            r.srem(PUSH_SUBS_KEY, sub_str)
            return response(200, {"ok": True}, origin, methods=METHODS)

        return error_response(405, "Method not allowed", origin)
    except Exception:
        return error_response(origin=origin)
