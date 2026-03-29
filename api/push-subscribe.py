"""POST/DELETE /api/push-subscribe — Web Push 구독 관리 (Redis)"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from http.server import BaseHTTPRequestHandler
import json
import redis
from _shared import send_cors_headers, send_error

REDIS_URL = os.environ.get("REDIS_URL", "")
PUSH_SUBS_KEY = "push_subs"
MAX_BODY_SIZE = 4096  # 4KB


def get_redis():
    return redis.from_url(REDIS_URL, decode_responses=True)


def _validate_subscription(sub):
    """구독 객체 필수 필드 검증"""
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


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length > MAX_BODY_SIZE:
                return send_error(self, 400, "Request body too large")

            body = self.rfile.read(content_length)
            sub = json.loads(body)

            if not _validate_subscription(sub):
                return send_error(self, 400, "Invalid subscription format")

            sub_str = json.dumps(sub, sort_keys=True)

            r = get_redis()
            r.sadd(PUSH_SUBS_KEY, sub_str)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            send_cors_headers(self, "POST, DELETE, OPTIONS")
            self.end_headers()
            self.wfile.write(json.dumps({"ok": True}).encode())
        except Exception:
            send_error(self)

    def do_DELETE(self):
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length > MAX_BODY_SIZE:
                return send_error(self, 400, "Request body too large")

            body = self.rfile.read(content_length)
            sub = json.loads(body)
            sub_str = json.dumps(sub, sort_keys=True)

            r = get_redis()
            r.srem(PUSH_SUBS_KEY, sub_str)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            send_cors_headers(self, "POST, DELETE, OPTIONS")
            self.end_headers()
            self.wfile.write(json.dumps({"ok": True}).encode())
        except Exception:
            send_error(self)

    def do_OPTIONS(self):
        self.send_response(204)
        send_cors_headers(self, "POST, DELETE, OPTIONS")
        self.end_headers()
