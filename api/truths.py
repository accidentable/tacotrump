"""GET /api/truths — 트럼프 Truth Social 최신 글 + OpenAI 한국어 번역"""

import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from http.server import BaseHTTPRequestHandler
import json
import re
import defusedxml.ElementTree as ET
import httpx
from _shared import send_cors_headers

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


def translate_posts(posts):
    """OpenAI API로 게시글 일괄 번역"""
    api_key = (os.getenv("OPENAI_API_KEY") or "").strip()
    if not api_key or not posts:
        return posts

    # 번역할 텍스트를 번호 매겨서 하나의 프롬프트로 묶기 (API 호출 최소화)
    numbered = []
    for i, p in enumerate(posts):
        text = p["content"][:300]  # 너무 긴 글 제한
        if text:
            numbered.append(f"[{i}] {text}")

    if not numbered:
        return posts

    batch_text = "\n".join(numbered)

    try:
        resp = httpx.post(
            "https://api.openai.com/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "gpt-4o-mini",
                "messages": [
                    {
                        "role": "system",
                        "content": (
                            "트럼프의 Truth Social 게시글을 한국어 뉴스 헤드라인으로 요약해주세요. "
                            "각 게시글은 [번호]로 시작합니다. 결과도 동일한 [번호] 형식으로 출력하세요. "
                            "각 게시글을 15자~30자 내외의 짧은 한줄 헤드라인으로 요약하세요. "
                            "URL은 출력하지 마세요. 핵심 내용만 담아주세요."
                        ),
                    },
                    {"role": "user", "content": batch_text},
                ],
                "temperature": 0.3,
                "max_tokens": 3000,
            },
            timeout=25.0,
        )

        if resp.status_code != 200:
            return posts

        result_text = resp.json()["choices"][0]["message"]["content"]

        # [번호] 패턴으로 파싱
        translations = {}
        for m in re.finditer(r'\[(\d+)\]\s*(.+?)(?=\n\[|\Z)', result_text, re.DOTALL):
            idx = int(m.group(1))
            translations[idx] = m.group(2).strip()

        # 번역 결과 매핑
        for i, p in enumerate(posts):
            if i in translations:
                p["translated"] = translations[i]

    except Exception:
        pass

    return posts


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        posts = fetch_truths()
        posts = translate_posts(posts)
        body = json.dumps(posts, ensure_ascii=False)
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        send_cors_headers(self)
        self.send_header("Cache-Control", "s-maxage=120, stale-while-revalidate=300")
        self.end_headers()
        self.wfile.write(body.encode())
