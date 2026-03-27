"""
TACO 점수 산정 엔진
핵심 6개 지표로 0~6점 산출 → 위험도 레벨 1~4 결정
(Vercel 배포 버전과 동기화)
"""

from app.models.schemas import RiskLevel

# 레드라인 기준값 (safe: 이 값 이하면 0점, value: 이 값 이상이면 1점)
REDLINES = {
    "sp500":           {"value": -15.0, "direction": "below", "safe": -3.0,  "label": "E-mini S&P 선물 고점 대비 하락률(%)"},
    "vix":             {"value": 35.0,  "direction": "above", "safe": 15.0,  "label": "VIX 공포지수"},
    "treasury_10y":    {"value": 4.5,   "direction": "above", "safe": 4.0,   "label": "미국 10년물 국채금리(%)"},
    "oil":             {"value": 100.0, "direction": "above", "safe": 75.0,  "label": "유가 (WTI, $/배럴)"},
    "dollar_index":    {"value": 110.0, "direction": "above", "safe": 97.0,  "label": "달러 인덱스"},
    "approval_rating": {"value": 35.0,  "direction": "below", "safe": 50.0,  "label": "대통령 지지율(%)"},
}

# 확장 지표 레드라인
EXTENDED_REDLINES = {
    "gasoline": {"value": 4.0, "direction": "above", "label": "전국 평균 휘발유 ($/갤런)"},
    "treasury_30y": {"value": 5.5, "direction": "above", "label": "미국 30년물 국채금리(%)"},
    "russell2000": {"value": -25.0, "direction": "below", "label": "Russell 2000 고점 대비 하락률(%)"},
}

CORE_KEYS = ["sp500", "vix", "treasury_10y", "oil", "dollar_index", "approval_rating"]


def calculate_indicator_score(key: str, value: float) -> float:
    """개별 지표의 레드라인 근접도를 0~1점으로 산출"""
    redline_info = REDLINES.get(key) or EXTENDED_REDLINES.get(key)
    if not redline_info:
        return 0.0

    rl = redline_info["value"]
    direction = redline_info["direction"]
    safe = redline_info.get("safe", 0.0)

    if direction == "above":
        if value <= safe:
            return 0.0
        if value >= rl:
            return 1.0
        return (value - safe) / (rl - safe)
    else:
        # below: S&P 500 (safe=-3, rl=-15) / 지지율 (safe=50, rl=35)
        if value >= safe:
            return 0.0
        if value <= rl:
            return 1.0
        return (safe - value) / (safe - rl)


def calculate_total_score(indicators: dict[str, float]) -> float:
    """핵심 6개 지표의 총점 산출 (0~6점)"""
    score = 0.0
    for key in CORE_KEYS:
        if key in indicators:
            score += calculate_indicator_score(key, indicators[key])
    return round(score, 2)


def get_risk_level(total_score: float) -> dict:
    """총점 → 위험도 레벨 결정 (max = 6.0)"""
    if total_score < 1.8:
        return {
            "level": RiskLevel.LEVEL_1,
            "label": "안전",
            "color": "#16A34A",
            "description": "시장 안정. 자신감 충전 중. 사고칠 확률 높음.",
        }
    elif total_score < 3.0:
        return {
            "level": RiskLevel.LEVEL_2,
            "label": "주의",
            "color": "#D97706",
            "description": "시장이 버티는 중. 한 방 더 올 수 있음.",
        }
    elif total_score < 4.2:
        return {
            "level": RiskLevel.LEVEL_3,
            "label": "경고",
            "color": "#EA580C",
            "description": "시장 흔들리는 중. 슬슬 꼬리 내릴 준비.",
        }
    else:
        return {
            "level": RiskLevel.LEVEL_4,
            "label": "위험",
            "color": "#DC2626",
            "description": "시장 패닉. 번복 임박.",
        }
