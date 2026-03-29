"""GET /api/pageviews — 방문자 수 카운터 (Vercel KV / Upstash Redis)"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from http.server import BaseHTTPRequestHandler
import json
import urllib.request
from _shared import send_cors_headers

# Vercel Redis / KV 환경변수 (여러 이름 패턴 대응)
KV_URL = (
    os.environ.get("KV_REST_API_URL")
    or os.environ.get("UPSTASH_REDIS_REST_URL")
    or os.environ.get("KV_URL")
    or ""
)
KV_TOKEN = (
    os.environ.get("KV_REST_API_TOKEN")
    or os.environ.get("UPSTASH_REDIS_REST_TOKEN")
    or os.environ.get("KV_REST_API_READ_ONLY_TOKEN")
    or ""
)


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        views = 0
        try:
            if KV_URL and KV_TOKEN:
                req = urllib.request.Request(
                    f"{KV_URL}/incr/pageviews",
                    method="POST",
                    headers={"Authorization": f"Bearer {KV_TOKEN}"},
                )
                with urllib.request.urlopen(req, timeout=3) as resp:
                    result = json.loads(resp.read())
                    views = result.get("result", 0)
        except Exception:
            pass

        body = json.dumps({"views": views})
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        send_cors_headers(self)
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(body.encode())
