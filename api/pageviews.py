"""GET /api/pageviews — 방문자 수 카운터 (Vercel KV / Upstash Redis)"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from http.server import BaseHTTPRequestHandler
import json
import urllib.request

KV_URL = os.environ.get("KV_REST_API_URL", "")
KV_TOKEN = os.environ.get("KV_REST_API_TOKEN", "")


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
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(body.encode())
