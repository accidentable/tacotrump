from fastapi import APIRouter
from app.models.schemas import Indicator, IndicatorsResponse
from app.services.data_collector import get_cached_data
from app.services.score_engine import (
    REDLINES,
    EXTENDED_REDLINES,
    calculate_indicator_score,
)

router = APIRouter()

INDICATOR_LABELS = {
    "sp500": {"label": "S&P 500 (고점대비)", "unit": "%"},
    "treasury_10y": {"label": "10년물 국채금리", "unit": "%"},
    "oil": {"label": "유가 (WTI)", "unit": "$/bbl"},
    "dollar_index": {"label": "달러 인덱스", "unit": ""},
    "gasoline": {"label": "전국 평균 휘발유", "unit": "$/gal"},
    "treasury_30y": {"label": "30년물 국채금리", "unit": "%"},
    "russell2000": {"label": "Russell 2000 (고점대비)", "unit": "%"},
    "approval_rating": {"label": "대통령 지지율", "unit": "%"},
}

CORE_KEYS = ["sp500", "treasury_10y", "oil", "dollar_index"]
EXTENDED_KEYS = ["gasoline", "treasury_30y", "russell2000", "approval_rating"]


@router.get("/indicators", response_model=IndicatorsResponse)
async def get_indicators():
    data, updated_at = get_cached_data()

    core = []
    extended = []

    for key in CORE_KEYS:
        indicator = _build_indicator(key, data, is_core=True)
        if indicator:
            core.append(indicator)

    for key in EXTENDED_KEYS:
        indicator = _build_indicator(key, data, is_core=False)
        if indicator:
            extended.append(indicator)

    return IndicatorsResponse(core=core, extended=extended, updated_at=updated_at or "N/A")


def _build_indicator(key: str, data: dict, is_core: bool) -> Indicator | None:
    if key not in data:
        return None

    info = data[key]
    meta = INDICATOR_LABELS.get(key, {"label": key, "unit": ""})
    redline_info = REDLINES.get(key) or EXTENDED_REDLINES.get(key)

    value = info["value"]
    prev = info.get("prev_value", value)
    change = round(value - prev, 4)
    change_pct = round((change / abs(prev)) * 100, 2) if prev != 0 else 0.0

    return Indicator(
        key=key,
        label=meta["label"],
        value=value,
        prev_value=prev,
        change=change,
        change_pct=change_pct,
        unit=meta["unit"],
        redline=redline_info["value"] if redline_info else None,
        redline_direction=redline_info["direction"] if redline_info else "above",
        score=calculate_indicator_score(key, value),
        is_core=is_core,
    )
