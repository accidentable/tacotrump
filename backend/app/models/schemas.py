from pydantic import BaseModel
from typing import Optional
from enum import IntEnum


class RiskLevel(IntEnum):
    LEVEL_1 = 1  # 안전 - 정책 유지 가능성 높음
    LEVEL_2 = 2  # 주의 - 일부 지표 악화
    LEVEL_3 = 3  # 경고 - 번복 가능성 상승
    LEVEL_4 = 4  # 위험 - 번복 임박


class Indicator(BaseModel):
    key: str
    label: str
    value: float
    prev_value: Optional[float] = None
    change: Optional[float] = None
    change_pct: Optional[float] = None
    unit: str = ""
    redline: Optional[float] = None
    redline_direction: str = "above"  # "above" = 값이 redline 위면 위험, "below" = 아래면 위험
    score: float = 0.0
    is_core: bool = True


class RiskResponse(BaseModel):
    level: int
    label: str
    color: str
    total_score: float
    max_score: float
    description: str


class HistoryEntry(BaseModel):
    timestamp: str
    total_score: float
    risk_level: int
    sp500: Optional[float] = None
    treasury_10y: Optional[float] = None
    oil: Optional[float] = None
    dollar_index: Optional[float] = None


class IndicatorsResponse(BaseModel):
    core: list[Indicator]
    extended: list[Indicator]
    updated_at: str
