"""Vercel 서버리스용 공유 로직 — 요청마다 실시간 데이터 fetch"""

import asyncio
import re
import os
import httpx

# ── Yahoo Finance ──────────────────────────────────────────────

TICKERS = {
    "treasury_10y": "^TNX",
    "sp500": "^GSPC",
    "oil": "BZ=F",
    "dollar_index": "DX-Y.NYB",
    "treasury_30y": "^TYX",
    "russell2000": "^RUT",
}

HEADERS = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
YAHOO_BASE = "https://query1.finance.yahoo.com/v8/finance/chart"


async def _fetch_ticker(client, key, ticker):
    try:
        r = await client.get(f"{YAHOO_BASE}/{ticker}", params={"range": "5d", "interval": "1d"})
        result = r.json()["chart"]["result"][0]
        meta = result["meta"]
        current = meta["regularMarketPrice"]
        prev_close = meta.get("chartPreviousClose") or meta.get("previousClose") or current

        if key in ("sp500", "russell2000"):
            high_52w = meta.get("fiftyTwoWeekHigh", current)
            pct = ((current - high_52w) / high_52w) * 100
            prev_pct = ((prev_close - high_52w) / high_52w) * 100
            return key, {"value": round(pct, 2), "raw_value": round(current, 2),
                         "prev_value": round(prev_pct, 2), "high_52w": round(high_52w, 2)}
        return key, {"value": round(current, 2), "prev_value": round(prev_close, 2)}
    except Exception:
        return key, None


async def fetch_yahoo():
    results = {}
    async with httpx.AsyncClient(headers=HEADERS, timeout=8.0, follow_redirects=True) as client:
        tasks = [_fetch_ticker(client, k, t) for k, t in TICKERS.items()]
        for resp in await asyncio.gather(*tasks, return_exceptions=True):
            if isinstance(resp, Exception):
                continue
            k, v = resp
            if v:
                results[k] = v
    return results


YAHOO_FALLBACK = {
    "treasury_10y": {"value": 4.25, "prev_value": 4.22},
    "sp500": {"value": -3.5, "raw_value": 5650.0, "prev_value": -3.2, "high_52w": 5856.0},
    "oil": {"value": 72.50, "prev_value": 73.10},
    "dollar_index": {"value": 104.20, "prev_value": 104.05},
    "treasury_30y": {"value": 4.55, "prev_value": 4.52},
    "russell2000": {"value": -8.5, "raw_value": 2050.0, "prev_value": -8.2, "high_52w": 2240.0},
}

# ── FRED (gasoline) ────────────────────────────────────────────

async def fetch_gasoline():
    api_key = os.getenv("FRED_API_KEY")
    if not api_key:
        return {"value": 3.45, "prev_value": 3.42}
    try:
        from datetime import datetime, timedelta
        end = datetime.now().strftime("%Y-%m-%d")
        start = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
        async with httpx.AsyncClient(timeout=8.0) as client:
            r = await client.get("https://api.stlouisfed.org/fred/series/observations",
                                 params={"series_id": "GASREGW", "api_key": api_key,
                                         "file_type": "json", "observation_start": start,
                                         "observation_end": end, "sort_order": "desc", "limit": 2})
            obs = r.json().get("observations", [])
            if obs:
                cur = float(obs[0]["value"])
                prev = float(obs[1]["value"]) if len(obs) > 1 else cur
                return {"value": round(cur, 3), "prev_value": round(prev, 3)}
    except Exception:
        pass
    return {"value": 3.45, "prev_value": 3.42}

# ── Approval (RCP) ─────────────────────────────────────────────

RCP_URL = "https://www.realclearpolling.com/polls/approval/donald-trump/approval-rating"


async def fetch_approval():
    try:
        async with httpx.AsyncClient(timeout=8.0, follow_redirects=True) as client:
            r = await client.get(RCP_URL, headers={"User-Agent": "Mozilla/5.0"})
            if r.status_code != 200:
                return {"value": 41.3, "prev_value": 41.3}
            idx = r.text.find("rcp_average")
            if idx < 0:
                return {"value": 41.3, "prev_value": 41.3}
            chunk = r.text[idx:idx + 500]
            m = re.search(r'Approve[^}]*?value[\\\":\s]+([\d.]+)', chunk)
            if m:
                v = float(m.group(1))
                return {"value": v, "prev_value": v}
    except Exception:
        pass
    return {"value": 41.3, "prev_value": 41.3}

# ── Score Engine ───────────────────────────────────────────────

REDLINES = {
    "sp500": {"value": -20.0, "direction": "below"},
    "treasury_10y": {"value": 5.0, "direction": "above"},
    "oil": {"value": 120.0, "direction": "above"},
    "dollar_index": {"value": 115.0, "direction": "above"},
    "gasoline": {"value": 4.0, "direction": "above"},
    "treasury_30y": {"value": 5.5, "direction": "above"},
    "russell2000": {"value": -25.0, "direction": "below"},
    "approval_rating": {"value": 35.0, "direction": "below"},
}

INDICATOR_LABELS = {
    "sp500": {"label": "S&P 500 (고점대비)", "unit": "%"},
    "treasury_10y": {"label": "10년물 국채금리", "unit": "%"},
    "oil": {"label": "유가 (브렌트)", "unit": "$/bbl"},
    "dollar_index": {"label": "달러 인덱스", "unit": ""},
    "gasoline": {"label": "전국 평균 휘발유", "unit": "$/gal"},
    "treasury_30y": {"label": "30년물 국채금리", "unit": "%"},
    "russell2000": {"label": "Russell 2000 (고점대비)", "unit": "%"},
    "approval_rating": {"label": "대통령 지지율", "unit": "%"},
}


def calc_indicator_score(key, value):
    info = REDLINES.get(key)
    if not info:
        return 0.0
    rl, d = info["value"], info["direction"]
    if d == "above":
        safe = rl * 0.6
        if value <= safe: return 0.0
        if value >= rl: return 1.0
        return (value - safe) / (rl - safe)
    else:
        if rl < 0:
            if value >= 0: return 0.0
            if value <= rl: return 1.0
            return abs(value) / abs(rl)
        else:
            safe = 55.0
            if value >= safe: return 0.0
            if value <= rl: return 1.0
            return (safe - value) / (safe - rl)


def calc_total(core_values):
    s = 0.0
    for k in ("sp500", "treasury_10y", "oil", "dollar_index"):
        if k in core_values:
            s += calc_indicator_score(k, core_values[k])
    return round(s, 2)


def get_risk(score):
    if score < 1.0:
        return {"level": 1, "label": "안전", "color": "#16A34A",
                "description": "경제 지표가 안정적입니다. 트럼프가 자신감을 갖고 강경책을 밀어붙일 가능성이 높습니다. 추가 관세·규제 등 새로운 사고를 칠 확률이 높은 구간입니다."}
    if score < 2.5:
        return {"level": 2, "label": "주의", "color": "#D97706",
                "description": "시장이 아직 버티고 있어 트럼프가 추가 강경책을 꺼낼 여지가 있습니다. 새로운 정책 도발 가능성에 주의하세요."}
    if score < 3.5:
        return {"level": 3, "label": "경고", "color": "#EA580C",
                "description": "다수 지표가 레드라인에 근접합니다. 정책 번복 가능성이 높아지고 있습니다."}
    return {"level": 4, "label": "위험", "color": "#DC2626",
            "description": "레드라인 초과 지표 다수. 정책 번복이 임박했을 수 있습니다."}


# ── 통합 fetch ─────────────────────────────────────────────────

async def fetch_all():
    yahoo, gas, approval = await asyncio.gather(
        fetch_yahoo(), fetch_gasoline(), fetch_approval(),
    )
    if not yahoo:
        yahoo = YAHOO_FALLBACK

    data = {**yahoo, "gasoline": gas, "approval_rating": approval}

    core_values = {k: data[k]["value"] for k in ("sp500", "treasury_10y", "oil", "dollar_index") if k in data}
    total = calc_total(core_values)
    risk = get_risk(total)

    return data, total, risk


def build_indicator(key, data, is_core):
    if key not in data:
        return None
    info = data[key]
    meta = INDICATOR_LABELS.get(key, {"label": key, "unit": ""})
    rl_info = REDLINES.get(key)
    value = info["value"]
    prev = info.get("prev_value", value)
    change = round(value - prev, 4)
    change_pct = round((change / abs(prev)) * 100, 2) if prev != 0 else 0.0
    return {
        "key": key, "label": meta["label"], "value": value, "prev_value": prev,
        "change": change, "change_pct": change_pct, "unit": meta["unit"],
        "redline": rl_info["value"] if rl_info else None,
        "redline_direction": rl_info["direction"] if rl_info else "above",
        "score": calc_indicator_score(key, value), "is_core": is_core,
    }
