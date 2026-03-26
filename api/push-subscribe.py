"""POST/DELETE /api/push-subscribe — Web Push 구독 관리 (Redis)"""

from http.server import BaseHTTPRequestHandler
import json
import os
import redis

REDIS_URL = os.environ.get("REDIS_URL", "")
PUSH_SUBS_KEY = "push_subs"


def get_redis():
    return redis.from_url(REDIS_URL, decode_responses=True)


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            body = self.rfile.read(int(self.headers.get("Content-Length", 0)))
            sub = json.loads(body)
            sub_str = json.dumps(sub, sort_keys=True)

            r = get_redis()
            r.sadd(PUSH_SUBS_KEY, sub_str)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"ok": True}).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def do_DELETE(self):
        try:
            body = self.rfile.read(int(self.headers.get("Content-Length", 0)))
            sub = json.loads(body)
            sub_str = json.dumps(sub, sort_keys=True)

            r = get_redis()
            r.srem(PUSH_SUBS_KEY, sub_str)

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(json.dumps({"ok": True}).encode())
        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
