"""GET /api/truths — 트럼프 Truth Social 최신 글"""

import re
import defusedxml.ElementTree as ET
import httpx
from lambda_utils import response, get_origin

RSS_URL = "https://www.trumpstruth.org/feed"


def strip_html(html: str) -> str:
    text = re.sub(r'<a[^>]*href="([^"]*)"[^>]*>[^<]*</a>', r' \1', html)
    text = re.sub(r'<[^>]+>', '', text)
    text = text.replace('&amp;', '&').replace('&lt;', '<').replace('&gt;', '>')
    text = text.replace('&#39;', "'").replace('&quot;', '"')
    return text.strip()


def fetch_truths(limit=10):
    try:
        r = httpx.get(RSS_URL, headers={"User-Agent": "Mozilla/5.0"}, timeout=8.0, follow_redirects=True)
        if r.status_code != 200:
            return []

        root = ET.fromstring(r.text)
        items = root.findall('.//item')

        posts = []
        for item in items[:limit]:
            title = item.findtext('title', '').strip()
            desc = item.findtext('description', '').strip()
            link = item.findtext('link', '').strip()
            pub_date = item.findtext('pubDate', '').strip()

            original_url = ''
            for child in item:
                if 'originalUrl' in child.tag:
                    original_url = (child.text or '').strip()

            content = strip_html(desc) if desc else title

            posts.append({
                "content": content,
                "title": title,
                "link": original_url or link,
                "published_at": pub_date,
            })

        return posts
    except Exception:
        return []


def handler(event, context):
    origin = get_origin(event)
    posts = fetch_truths()
    return response(200, posts, origin,
                    cache="s-maxage=120, stale-while-revalidate=300")
