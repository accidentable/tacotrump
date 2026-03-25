import asyncio
import json
from http.server import BaseHTTPRequestHandler
from _shared import fetch_all


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        _, total, risk = asyncio.run(fetch_all())

        body = json.dumps({
            "level": risk["level"],
            "label": risk["label"],
            "color": risk["color"],
            "total_score": total,
            "max_score": 4.0,
            "description": risk["description"],
        })

        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "s-maxage=30, stale-while-revalidate=60")
        self.end_headers()
        self.wfile.write(body.encode())
