"""AWS Lambda 응답/요청 유틸리티"""

import json

ALLOWED_ORIGIN = "https://tacotrump.space"
ALLOWED_ORIGINS = {ALLOWED_ORIGIN, "http://localhost:5173"}


def get_origin(event):
    headers = event.get("headers") or {}
    return headers.get("origin", "") or headers.get("Origin", "")


def cors_headers(origin, methods="GET, OPTIONS"):
    allowed = origin if origin in ALLOWED_ORIGINS else ALLOWED_ORIGIN
    return {
        "Access-Control-Allow-Origin": allowed,
        "Access-Control-Allow-Methods": methods,
        "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
    }


def response(status, body, origin="", methods="GET, OPTIONS", cache=None, extra_headers=None):
    headers = {
        "Content-Type": "application/json; charset=utf-8",
        **cors_headers(origin, methods),
    }
    if cache:
        headers["Cache-Control"] = cache
    if extra_headers:
        headers.update(extra_headers)
    return {
        "statusCode": status,
        "headers": headers,
        "body": json.dumps(body, ensure_ascii=False) if isinstance(body, (dict, list)) else body,
    }


def error_response(status=500, message="Internal server error", origin=""):
    return response(status, {"error": message}, origin)


def options_response(origin="", methods="GET, OPTIONS"):
    return {
        "statusCode": 204,
        "headers": {
            **cors_headers(origin, methods),
            "Access-Control-Max-Age": "86400",
        },
        "body": "",
    }


def get_query_params(event):
    return event.get("queryStringParameters") or {}


def get_body(event):
    body = event.get("body")
    if not body:
        return {}
    if event.get("isBase64Encoded"):
        import base64
        body = base64.b64decode(body).decode("utf-8")
    return json.loads(body)


def get_header(event, name):
    headers = event.get("headers") or {}
    return headers.get(name.lower(), "") or headers.get(name, "")


def get_method(event):
    rc = event.get("requestContext") or {}
    http = rc.get("http") or {}
    return http.get("method", event.get("httpMethod", "GET")).upper()
