"""GET /api/history — Yahoo Finance 히스토리 기반 점수 계산"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from http.server import BaseHTTPRequestHandler
import json
import asyncio
from urllib.parse import parse_qs, urlparse
import httpx
from _shared import (
    send_cors_headers, send_error,
    calc_indicator_score, get_risk, fetch_approval,
    YAHOO_BASE, HEADERS,
)

TICKERS = {
    "sp500": "^GSPC",
    "vix": "^VIX",
    "treasury_10y": "^TNX",
    "oil": "CL=F",
    "dollar_index": "DX-Y.NYB",
}

MARKET_KEYS = ("sp500", "vix", "treasury_10y", "oil", "dollar_index")


async def fetch_history(days=7):
    range_str = f"{days}d"
    all_series = {}

    # 지지율은 과거 데이터 없으므로 현재값을 전 구간에 적용
    approval = await fetch_approval()
    approval_value = approval["value"]

    async with httpx.AsyncClient(headers=HEADERS, timeout=10.0, follow_redirects=True) as client:
        for key, ticker in TICKERS.items():
            try:
                r = await client.get(
                    f"{YAHOO_BASE}/{ticker}",
                    params={"range": range_str, "interval": "1d"},
                )
                data = r.json()["chart"]["result"][0]
                timestamps = data.get("timestamp", [])
                closes = data["indicators"]["quote"][0].get("close", [])
                meta = data["meta"]
                high_52w = meta.get("fiftyTwoWeekHigh")

                for i, ts in enumerate(timestamps):
                    if closes[i] is None:
                        continue
                    date_str = _ts_to_date(ts)
                    if date_str not in all_series:
                        all_series[date_str] = {"timestamp": date_str}

                    if key == "sp500" and high_52w:
                        pct = ((closes[i] - high_52w) / high_52w) * 100
                        all_series[date_str][key] = round(pct, 2)
                    else:
                        all_series[date_str][key] = round(closes[i], 2)
            except Exception:
                continue

    # Forward-fill
    last_known = {}
    sorted_dates = sorted(all_series.keys())

    for date_str in sorted_dates:
        entry = all_series[date_str]
        for k in MARKET_KEYS:
            if k in entry:
                last_known[k] = entry[k]
            elif k in last_known:
                entry[k] = last_known[k]

    result = []
    for date_str in sorted_dates:
        entry = all_series[date_str]
        if not all(k in entry for k in MARKET_KEYS):
            continue
        total = 0.0
        for k in MARKET_KEYS:
            total += calc_indicator_score(k, entry[k])
        total += calc_indicator_score("approval_rating", approval_value)
        total = round(total, 2)
        risk = get_risk(total)
        result.append({
            "timestamp": f"{date_str}T00:00:00+09:00",
            "total_score": total,
            "risk_level": risk["level"],
            "sp500": entry.get("sp500"),
            "vix": entry.get("vix"),
            "treasury_10y": entry.get("treasury_10y"),
            "oil": entry.get("oil"),
            "dollar_index": entry.get("dollar_index"),
        })

    return result


def _ts_to_date(ts):
    from datetime import datetime, timezone
    return datetime.fromtimestamp(ts, tz=timezone.utc).strftime("%Y-%m-%d")


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        try:
            qs = parse_qs(urlparse(self.path).query)
            try:
                days = int(qs.get("days", ["7"])[0])
            except (ValueError, IndexError):
                days = 7
            days = max(1, min(days, 90))

            history = asyncio.run(fetch_history(days))

            body = json.dumps(history, ensure_ascii=False)
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            send_cors_headers(self)
            self.send_header("Cache-Control", "s-maxage=300, stale-while-revalidate=600")
            self.end_headers()
            self.wfile.write(body.encode())
        except Exception:
            send_error(self)
