"""Vercel 서버리스용 공유 로직 — 요청마다 실시간 데이터 fetch"""

import asyncio
import re
import os
import httpx

# ── Yahoo Finance ──────────────────────────────────────────────

TICKERS = {
    "treasury_10y": "^TNX",
    "sp500": "^GSPC",
    "oil": "CL=F",
    "dollar_index": "DX-Y.NYB",
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

        if key == "sp500":
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
    "oil": {"value": 68.50, "prev_value": 69.10},
    "dollar_index": {"value": 99.20, "prev_value": 99.05},
}

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

# safe: 이 값 이하면 0점, redline: 이 값 이상이면 1점
REDLINES = {
    "sp500":          {"value": -15.0, "direction": "below", "safe": -3.0},
    "treasury_10y":   {"value": 4.5,   "direction": "above", "safe": 4.0},
    "oil":            {"value": 100.0, "direction": "above", "safe": 75.0},
    "dollar_index":   {"value": 110.0, "direction": "above", "safe": 97.0},
    "approval_rating":{"value": 35.0,  "direction": "below", "safe": 50.0},
}

CORE_KEYS = ["sp500", "treasury_10y", "oil", "dollar_index", "approval_rating"]

INDICATOR_LABELS = {
    "sp500": {"label": "S&P 500 (고점대비)", "unit": "%"},
    "treasury_10y": {"label": "10년물 국채금리", "unit": "%"},
    "oil": {"label": "유가 (WTI)", "unit": "$/bbl"},
    "dollar_index": {"label": "달러 인덱스", "unit": ""},
    "approval_rating": {"label": "대통령 지지율", "unit": "%"},
}


def calc_indicator_score(key, value):
    info = REDLINES.get(key)
    if not info:
        return 0.0
    rl = info["value"]
    d = info["direction"]
    safe = info["safe"]

    if d == "above":
        if value <= safe: return 0.0
        if value >= rl: return 1.0
        return (value - safe) / (rl - safe)
    else:
        if rl < 0:
            # S&P 500: safe=-5, redline=-20
            if value >= safe: return 0.0
            if value <= rl: return 1.0
            return (safe - value) / (safe - rl)
        else:
            # 지지율: safe=50, redline=35
            if value >= safe: return 0.0
            if value <= rl: return 1.0
            return (safe - value) / (safe - rl)


def calc_total(core_values):
    s = 0.0
    for k in CORE_KEYS:
        if k in core_values:
            s += calc_indicator_score(k, core_values[k])
    return round(s, 2)


def get_risk(score):
    # max = 5.0 (5개 지표)
    if score < 1.5:
        return {"level": 1, "label": "안전", "color": "#16A34A",
                "description": "시장 안정. 자신감 충전 중. 사고칠 확률 높음."}
    if score < 2.5:
        return {"level": 2, "label": "주의", "color": "#D97706",
                "description": "시장이 버티는 중. 한 방 더 올 수 있음."}
    if score < 3.5:
        return {"level": 3, "label": "경고", "color": "#EA580C",
                "description": "시장 흔들리는 중. 슬슬 꼬리 내릴 준비."}
    return {"level": 4, "label": "위험", "color": "#DC2626",
            "description": "시장 패닉. 번복 임박."}


# ── 통합 fetch ─────────────────────────────────────────────────

async def fetch_all():
    yahoo, approval = await asyncio.gather(
        fetch_yahoo(), fetch_approval(),
    )
    if not yahoo:
        yahoo = YAHOO_FALLBACK

    data = {**yahoo, "approval_rating": approval}

    core_values = {k: data[k]["value"] for k in CORE_KEYS if k in data}
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
