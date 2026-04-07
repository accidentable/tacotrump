"""GET /api/developer/keys?email=... — 발급된 키 목록 조회
   DELETE /api/developer/keys — API 키 폐기"""

import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))

from http.server import BaseHTTPRequestHandler
import json
from urllib.parse import parse_qs, urlparse
from _auth import get_keys_for_email, revoke_api_key, send_json, send_cors_preflight


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        send_cors_preflight(self)

    def do_GET(self):
        try:
            qs = parse_qs(urlparse(self.path).query)
            email = (qs.get("email", [""])[0]).strip().lower()

            if not email:
                send_json(self, {"error": "email query parameter required."}, 400)
                return

            keys = get_keys_for_email(email)
            send_json(self, {"keys": keys})

        except Exception:
            send_json(self, {"error": "Internal server error"}, 500)

    def do_DELETE(self):
        try:
            length = int(self.headers.get("Content-Length", 0))
            body = json.loads(self.rfile.read(length)) if length > 0 else {}

            api_key = (body.get("api_key") or "").strip()
            if not api_key:
                send_json(self, {"error": "api_key is required in request body."}, 400)
                return

            success = revoke_api_key(api_key)
            if success:
                send_json(self, {"success": True, "message": "API key revoked."})
            else:
                send_json(self, {"error": "API key not found."}, 404)

        except Exception:
            send_json(self, {"error": "Internal server error"}, 500)
