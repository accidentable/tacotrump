"""WebSocket handler for real-time updates"""

import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)
router = APIRouter()

MAX_CLIENTS = 100

# 연결된 클라이언트 관리
_clients: set[WebSocket] = set()


async def broadcast(data: dict):
    """모든 연결된 클라이언트에 데이터 전송"""
    if not _clients:
        return

    message = json.dumps(data)
    disconnected = set()

    for ws in _clients:
        try:
            await ws.send_text(message)
        except Exception:
            disconnected.add(ws)

    _clients.difference_update(disconnected)


@router.websocket("/ws/realtime")
async def websocket_endpoint(websocket: WebSocket):
    if len(_clients) >= MAX_CLIENTS:
        await websocket.close(code=1008, reason="Too many connections")
        return
    await websocket.accept()
    _clients.add(websocket)
    logger.info(f"WebSocket client connected. Total: {len(_clients)}")

    try:
        while True:
            # 클라이언트 메시지 대기 (keep-alive)
            await websocket.receive_text()
    except WebSocketDisconnect:
        _clients.discard(websocket)
        logger.info(f"WebSocket client disconnected. Total: {len(_clients)}")
