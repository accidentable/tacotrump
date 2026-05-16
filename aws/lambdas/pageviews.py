"""GET /api/pageviews — 방문자 수 카운터 (Upstash Redis REST)"""

import json
import os
import urllib.request
from lambda_utils import response, get_origin

KV_URL = (
    os.environ.get("KV_REST_API_URL")
    or os.environ.get("UPSTASH_REDIS_REST_URL")
    or os.environ.get("KV_URL")
    or ""
)
KV_TOKEN = (
    os.environ.get("KV_REST_API_TOKEN")
    or os.environ.get("UPSTASH_REDIS_REST_TOKEN")
    or os.environ.get("KV_REST_API_READ_ONLY_TOKEN")
    or ""
)


def handler(event, context):
    origin = get_origin(event)
    views = 0
    try:
        if KV_URL and KV_TOKEN:
            req = urllib.request.Request(
                f"{KV_URL}/incr/pageviews",
                method="POST",
                headers={"Authorization": f"Bearer {KV_TOKEN}"},
            )
            with urllib.request.urlopen(req, timeout=3) as resp:
                result = json.loads(resp.read())
                views = result.get("result", 0)
    except Exception:
        pass

    return response(200, {"views": views}, origin, cache="no-cache")
