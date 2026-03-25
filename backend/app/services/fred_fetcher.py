"""FRED API 데이터 수집"""

import os
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)


async def fetch_gasoline_price() -> dict:
    """FRED API에서 전국 평균 휘발유 가격 수집"""
    api_key = os.getenv("FRED_API_KEY")

    if not api_key:
        logger.warning("FRED_API_KEY not set, using fallback data")
        return get_fallback_gasoline()

    try:
        import httpx

        end_date = datetime.now().strftime("%Y-%m-%d")
        start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")

        url = "https://api.stlouisfed.org/fred/series/observations"
        params = {
            "series_id": "GASREGW",
            "api_key": api_key,
            "file_type": "json",
            "observation_start": start_date,
            "observation_end": end_date,
            "sort_order": "desc",
            "limit": 2,
        }

        async with httpx.AsyncClient() as client:
            resp = await client.get(url, params=params)
            data = resp.json()

        observations = data.get("observations", [])
        if len(observations) >= 1:
            current = float(observations[0]["value"])
            prev = float(observations[1]["value"]) if len(observations) > 1 else current
            return {"value": round(current, 3), "prev_value": round(prev, 3)}

    except Exception as e:
        logger.error(f"FRED API error: {e}")

    return get_fallback_gasoline()


def get_fallback_gasoline() -> dict:
    return {"value": 3.45, "prev_value": 3.42}
