"""GET /api/v1/indicators — 전체 지표 데이터 (API 키 필수)"""

import asyncio
from datetime import datetime, timezone, timedelta
from shared import fetch_all, build_indicator, CORE_KEYS
from auth import require_api_key
from lambda_utils import response, error_response, options_response, get_origin

KST = timezone(timedelta(hours=9))


def handler(event, context):
    origin = get_origin(event)

    from lambda_utils import get_method
    if get_method(event) == "OPTIONS":
        return options_response(origin, "GET, OPTIONS")

    meta = require_api_key(event)
    if meta.get("_error"):
        return response(meta["status"], meta["body"], origin)

    try:
        data, total, risk = asyncio.run(fetch_all())
        core = [build_indicator(k, data, True) for k in CORE_KEYS]
        core = [c for c in core if c]
        now = datetime.now(KST).strftime("%Y-%m-%dT%H:%M:%S+09:00")

        return response(200, {
            "indicators": core,
            "total_score": total,
            "max_score": 6.0,
            "updated_at": now,
            "_rate_limit": {
                "remaining": meta.get("_remaining"),
                "daily_limit": meta.get("_limit"),
            },
        }, origin, cache="s-maxage=30, stale-while-revalidate=60")

    except Exception:
        return error_response(500, "Failed to fetch indicator data", origin)
