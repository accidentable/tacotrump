"""Yahoo Finance 데이터 수집 (httpx 직접 호출)"""

import asyncio
import httpx
import logging

logger = logging.getLogger(__name__)

TICKERS = {
    "treasury_10y": "^TNX",
    "sp500": "ES=F",
    "vix": "^VIX",
    "oil": "CL=F",
    "dollar_index": "DX-Y.NYB",
    "treasury_30y": "^TYX",
    "russell2000": "^RUT",
}

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart"


async def _fetch_one(client: httpx.AsyncClient, key: str, ticker: str) -> tuple[str, dict | None]:
    """개별 티커 데이터 수집"""
    try:
        # 5일치 일봉 데이터
        r = await client.get(
            f"{BASE_URL}/{ticker}",
            params={"range": "5d", "interval": "1d"},
        )
        data = r.json()
        result = data["chart"]["result"][0]
        meta = result["meta"]

        current = meta["regularMarketPrice"]
        prev_close = meta.get("chartPreviousClose") or meta.get("previousClose") or current

        # S&P 500, Russell 2000 → 52주 고점 대비 하락률
        if key in ("sp500", "russell2000"):
            high_52w = meta.get("fiftyTwoWeekHigh", current)
            pct_from_high = ((current - high_52w) / high_52w) * 100
            prev_pct = ((prev_close - high_52w) / high_52w) * 100
            return key, {
                "value": round(pct_from_high, 2),
                "raw_value": round(current, 2),
                "prev_value": round(prev_pct, 2),
                "high_52w": round(high_52w, 2),
            }
        else:
            return key, {
                "value": round(current, 2),
                "prev_value": round(prev_close, 2),
            }

    except Exception as e:
        logger.error(f"Error fetching {ticker}: {e}")
        return key, None


async def fetch_yahoo_data() -> dict[str, dict]:
    """Yahoo Finance v8 API로 시장 데이터 병렬 수집"""
    results = {}

    try:
        async with httpx.AsyncClient(headers=HEADERS, timeout=10.0, follow_redirects=True) as client:
            tasks = [_fetch_one(client, key, ticker) for key, ticker in TICKERS.items()]
            responses = await asyncio.gather(*tasks, return_exceptions=True)

            for resp in responses:
                if isinstance(resp, Exception):
                    logger.error(f"Fetch exception: {resp}")
                    continue
                key, data = resp
                if data is not None:
                    results[key] = data

    except Exception as e:
        logger.error(f"Yahoo fetch error: {e}")

    return results


def get_fallback_data() -> dict[str, dict]:
    """API 실패 시 fallback 데이터"""
    return {
        "treasury_10y": {"value": 4.25, "prev_value": 4.22},
        "sp500": {"value": -3.5, "raw_value": 5650.0, "prev_value": -3.2, "high_52w": 5856.0},
        "vix": {"value": 18.0, "prev_value": 17.5},
        "oil": {"value": 72.50, "prev_value": 73.10},
        "dollar_index": {"value": 104.20, "prev_value": 104.05},
        "treasury_30y": {"value": 4.55, "prev_value": 4.52},
        "russell2000": {"value": -8.5, "raw_value": 2050.0, "prev_value": -8.2, "high_52w": 2240.0},
    }
