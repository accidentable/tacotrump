"""GET /api/v1/risk-level — 종합 위험도 (API 키 필수)"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from http.server import BaseHTTPRequestHandler
import asyncio
from _shared import fetch_all
from _auth import require_api_key, send_json, send_cors_preflight


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        send_cors_preflight(self)

    def do_GET(self):
        meta = require_api_key(self)
        if not meta:
            return

        try:
            data, total, risk = asyncio.run(fetch_all())

            send_json(self, {
                "total_score": total,
                "max_score": 6.0,
                "level": risk["level"],
                "label": risk["label"],
                "color": risk["color"],
                "description": risk["description"],
                "_rate_limit": {
                    "remaining": meta.get("_remaining"),
                    "daily_limit": meta.get("_limit"),
                },
            }, cache="s-maxage=30, stale-while-revalidate=60")

        except Exception:
            send_json(self, {"error": "Failed to fetch risk data"}, 500)
