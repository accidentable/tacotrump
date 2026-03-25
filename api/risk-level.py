"""GET /api/risk-level — 종합 위험도 반환"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from http.server import BaseHTTPRequestHandler
import json
import asyncio
from _shared import fetch_all


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            data, total, risk = asyncio.run(fetch_all())

            body = json.dumps({
                "total_score": total,
                "max_score": 5.0,
                "level": risk["level"],
                "label": risk["label"],
                "color": risk["color"],
                "description": risk["description"],
            }, ensure_ascii=False)

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Cache-Control", "s-maxage=30, stale-while-revalidate=60")
            self.end_headers()
            self.wfile.write(body.encode())
        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
