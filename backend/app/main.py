import logging
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from apscheduler.schedulers.asyncio import AsyncIOScheduler

logging.basicConfig(level=logging.INFO)

from app.db.database import init_db
from app.routers import indicators, risk, history
from app.websocket.handler import router as ws_router
from app.services.data_collector import collect_all_data


scheduler = AsyncIOScheduler()


@asynccontextmanager
async def lifespan(app: FastAPI):
    import asyncio
    await init_db()
    # 데이터 수집을 백그라운드로 → 서버가 즉시 요청을 받을 수 있도록
    asyncio.create_task(collect_all_data())
    scheduler.add_job(collect_all_data, "interval", minutes=1, id="data_collector")
    scheduler.start()
    yield
    scheduler.shutdown()


app = FastAPI(
    title="TACO Dashboard API",
    description="Trump Administration Policy Change Odds Dashboard",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://tacotrump.space", "http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(indicators.router, prefix="/api")
app.include_router(risk.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(ws_router)


@app.get("/")
async def root():
    return {"message": "TACO Dashboard API", "version": "1.0.0"}
