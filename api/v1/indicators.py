"""GET /api/v1/indicators — 전체 지표 데이터 (API 키 필수)"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from http.server import BaseHTTPRequestHandler
import asyncio
from datetime import datetime, timezone, timedelta
from _shared import fetch_all, build_indicator, CORE_KEYS
from _auth import require_api_key, send_json, send_cors_preflight

KST = timezone(timedelta(hours=9))


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        send_cors_preflight(self)

    def do_GET(self):
        meta = require_api_key(self)
        if not meta:
            return

        try:
            data, total, risk = asyncio.run(fetch_all())
            core = [build_indicator(k, data, True) for k in CORE_KEYS]
            core = [c for c in core if c]
            now = datetime.now(KST).strftime("%Y-%m-%dT%H:%M:%S+09:00")

            send_json(self, {
                "indicators": core,
                "total_score": total,
                "max_score": 6.0,
                "updated_at": now,
                "_rate_limit": {
                    "remaining": meta.get("_remaining"),
                    "daily_limit": meta.get("_limit"),
                },
            }, cache="s-maxage=30, stale-while-revalidate=60")

        except Exception:
            send_json(self, {"error": "Failed to fetch indicator data"}, 500)
