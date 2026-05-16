"""GET /api/v1/risk-level — 종합 위험도 (API 키 필수)"""

import asyncio
from shared import fetch_all
from auth import require_api_key
from lambda_utils import response, error_response, options_response, get_origin, get_method


def handler(event, context):
    origin = get_origin(event)

    if get_method(event) == "OPTIONS":
        return options_response(origin, "GET, OPTIONS")

    meta = require_api_key(event)
    if meta.get("_error"):
        return response(meta["status"], meta["body"], origin)

    try:
        data, total, risk = asyncio.run(fetch_all())

        return response(200, {
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
        }, origin, cache="s-maxage=30, stale-while-revalidate=60")

    except Exception:
        return error_response(500, "Failed to fetch risk data", origin)
