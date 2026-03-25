from fastapi import APIRouter
from app.models.schemas import RiskResponse
from app.services.data_collector import get_cached_data
from app.services.score_engine import calculate_total_score, get_risk_level

router = APIRouter()


@router.get("/risk-level", response_model=RiskResponse)
async def get_risk():
    data, _ = get_cached_data()

    core_values = {}
    for key in ["sp500", "treasury_10y", "oil", "dollar_index"]:
        if key in data:
            core_values[key] = data[key]["value"]

    total_score = calculate_total_score(core_values)
    risk = get_risk_level(total_score)

    return RiskResponse(
        level=risk["level"],
        label=risk["label"],
        color=risk["color"],
        total_score=total_score,
        max_score=4.0,
        description=risk["description"],
    )
