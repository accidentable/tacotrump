"""GET /api/developer/keys — 발급된 키 목록 조회
   DELETE /api/developer/keys — API 키 폐기"""

from auth import get_keys_for_email, revoke_api_key
from lambda_utils import (
    response, error_response, options_response,
    get_origin, get_method, get_query_params, get_body,
)


def handler(event, context):
    origin = get_origin(event)
    method = get_method(event)

    if method == "OPTIONS":
        return options_response(origin, "GET, DELETE, OPTIONS")

    try:
        if method == "GET":
            params = get_query_params(event)
            email = (params.get("email", "") or "").strip().lower()

            if not email:
                return response(400, {"error": "email query parameter required."}, origin)

            keys = get_keys_for_email(email)
            return response(200, {"keys": keys}, origin)

        elif method == "DELETE":
            body = get_body(event)
            api_key = (body.get("api_key") or "").strip()

            if not api_key:
                return response(400, {"error": "api_key is required in request body."}, origin)

            success = revoke_api_key(api_key)
            if success:
                return response(200, {"success": True, "message": "API key revoked."}, origin)
            else:
                return response(404, {"error": "API key not found."}, origin)

        return error_response(405, "Method not allowed", origin)
    except Exception:
        return error_response(origin=origin)
