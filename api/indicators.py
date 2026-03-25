import asyncio
import json
from datetime import datetime
from http.server import BaseHTTPRequestHandler
from _shared import fetch_all, build_indicator


CORE_KEYS = ["sp500", "treasury_10y", "oil", "dollar_index"]
EXTENDED_KEYS = ["gasoline", "treasury_30y", "russell2000", "approval_rating"]


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        data, _, _ = asyncio.run(fetch_all())

        core = [x for k in CORE_KEYS if (x := build_indicator(k, data, True))]
        extended = [x for k in EXTENDED_KEYS if (x := build_indicator(k, data, False))]

        body = json.dumps({
            "core": core,
            "extended": extended,
            "updated_at": datetime.now().isoformat(),
        })

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "s-maxage=30, stale-while-revalidate=60")
        self.end_headers()
        self.wfile.write(body.encode())
