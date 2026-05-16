"""로컬 테스트 서버 — Lambda 핸들러를 HTTP로 노출"""

import sys
import os
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# lambdas/ 디렉토리를 import 경로에 추가
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "lambdas"))

# .env.local 로드 (있으면)
env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
if os.path.exists(env_path):
    with open(env_path) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip())

# Lambda 핸들러 import
import indicators
import risk_level
import history
import truths
import pageviews
import push_subscribe
import v1_indicators
import v1_risk_level
import v1_history
import dev_register
import dev_keys

# 라우팅 테이블: (method, path) -> handler
ROUTES = {
    ("GET", "/api/indicators"): indicators.handler,
    ("GET", "/api/risk-level"): risk_level.handler,
    ("GET", "/api/history"): history.handler,
    ("GET", "/api/truths"): truths.handler,
    ("GET", "/api/pageviews"): pageviews.handler,
    ("POST", "/api/push-subscribe"): push_subscribe.handler,
    ("DELETE", "/api/push-subscribe"): push_subscribe.handler,
    ("GET", "/api/v1/indicators"): v1_indicators.handler,
    ("GET", "/api/v1/risk-level"): v1_risk_level.handler,
    ("GET", "/api/v1/history"): v1_history.handler,
    ("POST", "/api/developer/register"): dev_register.handler,
    ("GET", "/api/developer/keys"): dev_keys.handler,
    ("DELETE", "/api/developer/keys"): dev_keys.handler,
}


def build_lambda_event(method, path, query_params, headers, body):
    """HTTP 요청을 Lambda event 형식으로 변환"""
    return {
        "requestContext": {
            "http": {"method": method, "path": path},
        },
        "headers": {k.lower(): v for k, v in headers.items()},
        "queryStringParameters": query_params or None,
        "body": body,
        "isBase64Encoded": False,
    }


class LocalHandler(BaseHTTPRequestHandler):
    def _handle(self, method):
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query)
        # parse_qs는 list로 반환하므로 첫 값만 추출
        query_params = {k: v[0] for k, v in qs.items()} if qs else {}

        # 라우팅
        handler_fn = ROUTES.get((method, path))

        # OPTIONS는 모든 경로에서 허용
        if method == "OPTIONS":
            for key, fn in ROUTES.items():
                if key[1] == path:
                    handler_fn = fn
                    break

        if not handler_fn:
            self.send_response(404)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": f"Not found: {method} {path}"}).encode())
            return

        # body 읽기
        content_length = int(self.headers.get("Content-Length", 0))
        body = self.rfile.read(content_length).decode() if content_length > 0 else None

        # Lambda event 생성
        event = build_lambda_event(method, path, query_params, dict(self.headers), body)

        # 핸들러 실행
        try:
            result = handler_fn(event, None)
        except Exception as e:
            self.send_response(500)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(json.dumps({"error": str(e)}).encode())
            return

        # 응답 전송
        self.send_response(result.get("statusCode", 200))
        for k, v in result.get("headers", {}).items():
            self.send_header(k, v)
        self.end_headers()
        body_out = result.get("body", "")
        if body_out:
            self.wfile.write(body_out.encode() if isinstance(body_out, str) else body_out)

    def do_GET(self):
        self._handle("GET")

    def do_POST(self):
        self._handle("POST")

    def do_DELETE(self):
        self._handle("DELETE")

    def do_OPTIONS(self):
        self._handle("OPTIONS")

    def log_message(self, format, *args):
        status = args[1] if len(args) > 1 else ""
        print(f"  {args[0]} → {status}")


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
    print(f"SweetTACO Local Server @ http://localhost:{port}")
    print(f"Routes:")
    for (method, path) in sorted(ROUTES.keys(), key=lambda x: x[1]):
        print(f"  {method:6s} {path}")
    print()
    HTTPServer(("0.0.0.0", port), LocalHandler).serve_forever()
