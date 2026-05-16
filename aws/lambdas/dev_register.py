"""POST /api/developer/register — API 키 발급"""

import re
from auth import generate_api_key
from lambda_utils import (
    response, error_response, options_response,
    get_origin, get_method, get_body,
)


def handler(event, context):
    origin = get_origin(event)

    if get_method(event) == "OPTIONS":
        return options_response(origin, "POST, OPTIONS")

    try:
        body = get_body(event)
        email = (body.get("email") or "").strip().lower()
        app_name = (body.get("app_name") or "").strip()

        if not email or not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", email):
            return response(400, {"error": "Valid email is required."}, origin)

        if len(app_name) > 100:
            return response(400, {"error": "app_name must be 100 characters or less."}, origin)

        result = generate_api_key(email, app_name)

        if "error" in result:
            return response(429, result, origin)

        return response(201, {
            "success": True,
            "message": "API key generated successfully. Store it safely — it won't be shown again.",
            "data": result,
        }, origin)

    except Exception:
        return error_response(origin=origin)
