"""GET /api/indicators — 모든 지표 데이터 반환"""

import asyncio
from datetime import datetime, timezone, timedelta
from shared import fetch_all, build_indicator, CORE_KEYS
from lambda_utils import response, error_response, get_origin

KST = timezone(timedelta(hours=9))


def handler(event, context):
    origin = get_origin(event)
    try:
        data, total, risk = asyncio.run(fetch_all())

        core = [build_indicator(k, data, True) for k in CORE_KEYS]
        core = [c for c in core if c]

        now = datetime.now(KST).strftime("%Y-%m-%d %H:%M KST")

        return response(200, {
            "core": core,
            "extended": [],
            "updated_at": now,
        }, origin, cache="s-maxage=30, stale-while-revalidate=60")
    except Exception:
        return error_response(origin=origin)
