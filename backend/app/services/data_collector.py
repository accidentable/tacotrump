"""통합 데이터 수집 서비스"""

import logging
from datetime import datetime

import aiosqlite

from app.db.database import DB_PATH
from app.services.yahoo_fetcher import fetch_yahoo_data, get_fallback_data
from app.services.fred_fetcher import fetch_gasoline_price
from app.services.approval_scraper import fetch_approval_rating
from app.services.score_engine import calculate_total_score, get_risk_level
from app.websocket.handler import broadcast

logger = logging.getLogger(__name__)

# 메모리 캐시
_latest_data: dict = {}
_last_updated: str = ""


def get_cached_data() -> tuple[dict, str]:
    return _latest_data, _last_updated


async def collect_all_data():
    """모든 데이터 소스에서 수집 후 DB 저장 + 브로드캐스트"""
    global _latest_data, _last_updated

    logger.info("Collecting data...")

    # Yahoo Finance 데이터 (스레드에서 실행)
    yahoo_data = {}
    try:
        yahoo_data = await fetch_yahoo_data()
    except Exception as e:
        logger.error(f"Yahoo fetch failed: {e}")

    # 데이터가 비었으면 fallback 사용
    if not yahoo_data:
        logger.warning("Using fallback market data")
        yahoo_data = get_fallback_data()

    # FRED 데이터
    try:
        gasoline = await fetch_gasoline_price()
    except Exception as e:
        logger.error(f"FRED fetch failed: {e}")
        gasoline = {"value": 3.45, "prev_value": 3.42}

    # 지지율 데이터
    try:
        approval = await fetch_approval_rating()
    except Exception as e:
        logger.error(f"Approval fetch failed: {e}")
        approval = {"value": 42.5, "prev_value": 43.0}

    # 통합
    all_data = {**yahoo_data}
    all_data["gasoline"] = gasoline
    all_data["approval_rating"] = approval

    # 핵심 지표로 점수 산출
    core_values = {}
    for key in ["sp500", "vix", "treasury_10y", "oil", "dollar_index"]:
        if key in all_data:
            core_values[key] = all_data[key]["value"]

    total_score = calculate_total_score(core_values)
    risk_info = get_risk_level(total_score)

    now = datetime.now().isoformat()

    # 캐시 업데이트 (DB 저장 전에 먼저 업데이트 — API가 바로 응답할 수 있도록)
    _latest_data = all_data
    _latest_data["_total_score"] = total_score
    _latest_data["_risk"] = risk_info
    _last_updated = now

    # DB 저장
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            await db.execute(
                """INSERT INTO indicator_history
                   (timestamp, sp500, treasury_10y, oil, dollar_index,
                    gasoline, treasury_30y, russell2000, approval_rating,
                    total_score, risk_level)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    now,
                    all_data.get("sp500", {}).get("value"),
                    all_data.get("treasury_10y", {}).get("value"),
                    all_data.get("oil", {}).get("value"),
                    all_data.get("dollar_index", {}).get("value"),
                    all_data.get("gasoline", {}).get("value"),
                    all_data.get("treasury_30y", {}).get("value"),
                    all_data.get("russell2000", {}).get("value"),
                    all_data.get("approval_rating", {}).get("value"),
                    total_score,
                    risk_info["level"],
                ),
            )

            for key, data in all_data.items():
                if key.startswith("_"):
                    continue
                await db.execute(
                    """INSERT OR REPLACE INTO latest_indicators (key, value, prev_value, updated_at)
                       VALUES (?, ?, ?, ?)""",
                    (key, data["value"], data.get("prev_value"), now),
                )

            await db.commit()
    except Exception as e:
        logger.error(f"DB save error: {e}")

    # WebSocket 브로드캐스트
    try:
        await broadcast({
            "type": "update",
            "total_score": total_score,
            "risk_level": risk_info["level"],
            "timestamp": now,
        })
    except Exception as e:
        logger.error(f"Broadcast error: {e}")

    logger.info(f"Data collected. Score: {total_score}, Level: {risk_info['level']}")
