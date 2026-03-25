from fastapi import APIRouter, Query
import aiosqlite
from app.db.database import DB_PATH
from app.models.schemas import HistoryEntry

router = APIRouter()


@router.get("/history", response_model=list[HistoryEntry])
async def get_history(days: int = Query(default=30, ge=1, le=365)):
    entries = []
    try:
        async with aiosqlite.connect(DB_PATH) as db:
            db.row_factory = aiosqlite.Row
            cursor = await db.execute(
                """SELECT timestamp, total_score, risk_level,
                          sp500, treasury_10y, oil, dollar_index
                   FROM indicator_history
                   ORDER BY timestamp DESC
                   LIMIT ?""",
                (days * 24 * 60,),  # 분당 1회 수집 기준
            )
            rows = await cursor.fetchall()

            for row in rows:
                entries.append(
                    HistoryEntry(
                        timestamp=row[0],
                        total_score=row[1] or 0,
                        risk_level=row[2] or 1,
                        sp500=row[3],
                        treasury_10y=row[4],
                        oil=row[5],
                        dollar_index=row[6],
                    )
                )
    except Exception:
        pass

    entries.reverse()
    return entries
