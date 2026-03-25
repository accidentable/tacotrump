"""
TACO 점수 산정 엔진
핵심 4개 지표로 0~4점 산출 → 위험도 레벨 1~4 결정
"""

from app.models.schemas import RiskLevel

# 레드라인 기준값
REDLINES = {
    "sp500": {"value": -20.0, "direction": "below", "label": "S&P 500 고점 대비 하락률(%)"},
    "treasury_10y": {"value": 5.0, "direction": "above", "label": "미국 10년물 국채금리(%)"},
    "oil": {"value": 120.0, "direction": "above", "label": "유가 (WTI, $/배럴)"},
    "dollar_index": {"value": 115.0, "direction": "above", "label": "달러 인덱스"},
}

# 확장 지표 레드라인
EXTENDED_REDLINES = {
    "gasoline": {"value": 4.0, "direction": "above", "label": "전국 평균 휘발유 ($/갤런)"},
    "treasury_30y": {"value": 5.5, "direction": "above", "label": "미국 30년물 국채금리(%)"},
    "russell2000": {"value": -25.0, "direction": "below", "label": "Russell 2000 고점 대비 하락률(%)"},
    "approval_rating": {"value": 35.0, "direction": "below", "label": "대통령 지지율(%)"},
}


def calculate_indicator_score(key: str, value: float) -> float:
    """개별 지표의 레드라인 근접도를 0~1점으로 산출"""
    redline_info = REDLINES.get(key) or EXTENDED_REDLINES.get(key)
    if not redline_info:
        return 0.0

    redline = redline_info["value"]
    direction = redline_info["direction"]

    if direction == "above":
        # 값이 높을수록 위험 (금리, 유가, 달러)
        # 기준점(안전): 레드라인의 60% 수준
        safe_value = redline * 0.6
        if value <= safe_value:
            return 0.0
        elif value >= redline:
            return 1.0
        else:
            return (value - safe_value) / (redline - safe_value)
    else:
        # 값이 낮을수록 위험 (S&P 하락률, 지지율)
        safe_value = redline * 0.3 if redline < 0 else redline * 1.5
        if direction == "below" and redline < 0:
            # 하락률: 0%가 안전, -20%가 레드라인
            if value >= 0:
                return 0.0
            elif value <= redline:
                return 1.0
            else:
                return abs(value) / abs(redline)
        else:
            # 지지율: 높을수록 안전
            safe_value = 55.0
            if value >= safe_value:
                return 0.0
            elif value <= redline:
                return 1.0
            else:
                return (safe_value - value) / (safe_value - redline)


def calculate_total_score(indicators: dict[str, float]) -> float:
    """핵심 4개 지표의 총점 산출 (0~4점)"""
    score = 0.0
    for key in ["sp500", "treasury_10y", "oil", "dollar_index"]:
        if key in indicators:
            score += calculate_indicator_score(key, indicators[key])
    return round(score, 2)


def get_risk_level(total_score: float) -> dict:
    """총점 → 위험도 레벨 결정"""
    if total_score < 1.0:
        return {
            "level": RiskLevel.LEVEL_1,
            "label": "안전",
            "color": "#2ECC71",
            "description": "경제 지표가 안정적입니다. 트럼프가 자신감을 갖고 강경책을 밀어붙일 가능성이 높습니다. 추가 관세·규제 등 새로운 사고를 칠 확률이 높은 구간입니다.",
        }
    elif total_score < 2.5:
        return {
            "level": RiskLevel.LEVEL_2,
            "label": "주의",
            "color": "#F39C12",
            "description": "시장이 아직 버티고 있어 트럼프가 추가 강경책을 꺼낼 여지가 있습니다. 새로운 정책 도발 가능성에 주의하세요.",
        }
    elif total_score < 3.5:
        return {
            "level": RiskLevel.LEVEL_3,
            "label": "경고",
            "color": "#E67E22",
            "description": "다수 지표가 레드라인에 근접합니다. 정책 번복 가능성이 높아지고 있습니다.",
        }
    else:
        return {
            "level": RiskLevel.LEVEL_4,
            "label": "위험",
            "color": "#E74C3C",
            "description": "레드라인 초과 지표 다수. 정책 번복이 임박했을 수 있습니다.",
        }
