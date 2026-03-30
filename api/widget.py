"""GET /api/widget — 위젯 전용 경량 API (TACO 점수 + 상위 3개 지표)"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from http.server import BaseHTTPRequestHandler
import json
import asyncio
from datetime import datetime, timezone, timedelta
from _shared import (
    fetch_all, send_error, CORE_KEYS,
    calc_indicator_score, INDICATOR_LABELS, build_indicator,
)


class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        try:
            data, total, risk = asyncio.run(fetch_all())

            # 상위 3개 지표 (점수 높은 순)
            scored = []
            for k in CORE_KEYS:
                if k in data:
                    val = data[k]["value"]
                    score = calc_indicator_score(k, val)
                    meta = INDICATOR_LABELS.get(k, {"label": k, "unit": ""})
                    scored.append({
                        "key": k,
                        "label": meta["label"],
                        "value": val,
                        "score": round(score, 2),
                    })
            scored.sort(key=lambda x: x["score"], reverse=True)
            top3 = scored[:3]

            kst = datetime.now(timezone(timedelta(hours=9)))

            body = json.dumps({
                "level": risk["level"],
                "label": risk["label"],
                "color": risk["color"],
                "score": total,
                "max": 6.0,
                "description": risk["description"],
                "top_indicators": top3,
                "updated_at": kst.strftime("%Y-%m-%dT%H:%M:%S"),
            }, ensure_ascii=False)

            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
            self.send_header("Cache-Control", "s-maxage=300, stale-while-revalidate=600")
            self.end_headers()
            self.wfile.write(body.encode())
        except Exception:
            send_error(self)
