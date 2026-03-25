"""대통령 지지율 데이터 수집 - RealClearPolitics 스크래핑"""

import re
import logging
import httpx

logger = logging.getLogger(__name__)

RCP_URL = "https://www.realclearpolling.com/polls/approval/donald-trump/approval-rating"


async def fetch_approval_rating() -> dict:
    """RealClearPolitics에서 트럼프 지지율 RCP Average 스크래핑"""
    try:
        async with httpx.AsyncClient(timeout=10.0, follow_redirects=True) as client:
            r = await client.get(RCP_URL, headers={"User-Agent": "Mozilla/5.0"})

            if r.status_code != 200:
                logger.warning(f"RCP returned {r.status_code}")
                return _fallback()

            text = r.text

            # 이스케이프된 JSON에서 rcp_average 블록 찾기
            # \"type\":\"rcp_average\" ... \"Approve\" ... \"value\":\"XX.X\"
            idx = text.find("rcp_average")
            if idx < 0:
                logger.warning("rcp_average not found in page")
                return _fallback()

            # rcp_average 근처 500자에서 Approve 값 추출
            chunk = text[idx:idx + 500]

            approve_match = re.search(
                r'Approve[^}]*?value[\\\":\s]+([\d.]+)',
                chunk,
            )

            if not approve_match:
                logger.warning("Approve value not found")
                return _fallback()

            approve = float(approve_match.group(1))
            logger.info(f"RCP Trump approval: {approve}%")

            return {"value": approve, "prev_value": approve}

    except Exception as e:
        logger.error(f"RCP scraping error: {e}")
        return _fallback()


def _fallback() -> dict:
    return {"value": 41.3, "prev_value": 41.3}
