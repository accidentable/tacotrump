"""POST /api/developer/register — API 키 발급"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from http.server import BaseHTTPRequestHandler
import json
import re
from _auth import generate_api_key, send_json, send_cors_preflight


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        send_cors_preflight(self)

    def do_POST(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length)) if length > 0 else {}

            email = (body.get("email") or "").strip().lower()
            app_name = (body.get("app_name") or "").strip()

            if not email or not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
                send_json(self, {"error": "Valid email is required."}, 400)
                return

            if len(app_name) > 100:
                send_json(self, {"error": "app_name must be 100 characters or less."}, 400)
                return

            result = generate_api_key(email, app_name)

            if "error" in result:
                send_json(self, result, 429)
                return

            send_json(self, {
                "success": True,
                "message": "API key generated successfully. Store it safely — it won't be shown again.",
                "data": result,
            }, 201)

        except Exception as e:
            send_json(self, {"error": "Internal server error"}, 500)
