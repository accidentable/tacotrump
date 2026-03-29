"""GET /api/indicators — 모든 지표 데이터 반환"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from http.server import BaseHTTPRequestHandler
import json
import asyncio
from _shared import fetch_all, build_indicator, CORE_KEYS, send_cors_headers, send_error
from datetime import datetime, timezone, timedelta

KST = timezone(timedelta(hours=9))


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            data, total, risk = asyncio.run(fetch_all())

            core = [build_indicator(k, data, True) for k in CORE_KEYS]
            core = [c for c in core if c]
            extended = []

            now = datetime.now(KST).strftime("%Y-%m-%d %H:%M KST")

            body = json.dumps({"core": core, "extended": extended, "updated_at": now}, ensure_ascii=False)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            send_cors_headers(self)
            self.send_header("Cache-Control", "s-maxage=30, stale-while-revalidate=60")
            self.end_headers()
            self.wfile.write(body.encode())
        except Exception:
            send_error(self)
