"""GET /api/risk-level — 종합 위험도 반환"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from http.server import BaseHTTPRequestHandler
import json
import asyncio
from _shared import fetch_all, send_cors_headers, send_error


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            data, total, risk = asyncio.run(fetch_all())

            body = json.dumps({
                "total_score": total,
                "max_score": 6.0,
                "level": risk["level"],
                "label": risk["label"],
                "color": risk["color"],
                "description": risk["description"],
            }, ensure_ascii=False)

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            send_cors_headers(self)
            self.send_header("Cache-Control", "s-maxage=30, stale-while-revalidate=60")
            self.end_headers()
            self.wfile.write(body.encode())
        except Exception:
            send_error(self)
