import aiosqlite
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "taco.db")


async def get_db():
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    try:
        yield db
    finally:
        await db.close()


async def init_db():
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS indicator_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                sp500 REAL,
                treasury_10y REAL,
                oil REAL,
                dollar_index REAL,
                gasoline REAL,
                treasury_30y REAL,
                russell2000 REAL,
                approval_rating REAL,
                total_score REAL,
                risk_level INTEGER
            )
        """)
        await db.execute("""
            CREATE TABLE IF NOT EXISTS latest_indicators (
                key TEXT PRIMARY KEY,
                value REAL,
                prev_value REAL,
                updated_at TEXT
            )
        """)
        await db.commit()
