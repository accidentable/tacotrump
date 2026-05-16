"""GET /api/risk-level — 종합 위험도 반환"""

import asyncio
from shared import fetch_all
from lambda_utils import response, error_response, get_origin


def handler(event, context):
    origin = get_origin(event)
    try:
        data, total, risk = asyncio.run(fetch_all())

        return response(200, {
            "total_score": total,
            "max_score": 6.0,
            "level": risk["level"],
            "label": risk["label"],
            "color": risk["color"],
            "description": risk["description"],
        }, origin, cache="s-maxage=30, stale-while-revalidate=60")
    except Exception:
        return error_response(origin=origin)
