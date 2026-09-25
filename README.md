<div align="center">

# 타코 트럼프 (TACO Index)

시장 지표 6개로 트럼프 정책 번복 가능성을 0~6점, 4단계 레벨로 보여 주던 웹 서비스

2026.03.25 ~ 04 중순 운영 · 종료 · [KPI뉴스 보도](https://m.kpinews.kr/newsView/1065595079655327) · [위키 정리](https://github.com/accidentable/My_WIKI/blob/main/wiki/projects/taco-index-2026-03.md)

</div>

## About

뉴스에서 본 "TACO(Trump Always Chickens Out)"를 숫자로 보여 주면 재미있겠다는 생각에서 시작했습니다. AI 코딩 도구로 두 시간 만에 첫 판을 만들어 Vercel에 올렸고, 학회 SNS에 공유한 것이 커뮤니티로 퍼져 언론에 소개됐습니다. 기획, 개발, 배포, 운영은 혼자 했습니다.

![운영 3주 방문 추이](docs/vercel-analytics.png)

| 방문자 | 페이지뷰 | 이탈률 | 정점 |
|---|---|---|---|
| 56,253명 | 104,037 | 70% | 3월 29일, 하루 약 1만 8천 명 |

유료 마케팅 없이 3주 동안 기록한 수치입니다. 지수의 예측 정확도를 검증한 기록은 없습니다.

### Built With

- Frontend: React 19, Vite, TypeScript, Tailwind CSS 4, recharts
- API: Python 서버리스 함수 (Vercel), FastAPI 로컬판
- Infra: 호스팅형 Redis, Vercel Cron, Web Push (VAPID), OpenAI API
- 5월에 서버리스를 직접 다뤄 보려고 AWS Lambda + API Gateway + CloudFront로 옮기는 SAM 템플릿 추가

## How It Works

| 지표 | 출처 | safe | redline |
|---|---|---|---|
| E-mini S&P 선물 고점 대비 | Yahoo `ES=F` | -3% | -15% |
| VIX | Yahoo `^VIX` | 15 | 35 |
| 미 10년물 금리 | Yahoo `^TNX` | 4.0% | 4.5% |
| WTI 유가 | Yahoo `CL=F` | 75 | 100 |
| 달러 인덱스 | Yahoo `DX-Y.NYB` | 97 | 110 |
| 대통령 지지율 | RealClearPolling | 50% | 35% |

- 각 지표를 safe와 redline 사이에서 0~1로 선형 보간해 합산 (만점 6.0). 경계 1.8 / 3.0 / 4.2로 레벨 1~4
- 상시 서버 없이 요청마다 외부 API를 호출하고 `s-maxage` 엣지 캐시로 호출량을 억제
- 매시간 크론이 레벨을 계산해 Redis의 직전 레벨과 비교하고, 바뀐 경우에만 구독자에게 푸시
- 모든 외부 호출에 fallback 상수를 두어 화면이 비지 않게 함
- 레드라인 값은 직접 정한 값이며 통계적 근거는 없음

### AI와 나눈 일

| 직접 결정 | AI에 맡김 | 직접 검토·운영 |
|---|---|---|
| 지표 6개 구성과 레드라인, 레벨이 바뀔 때만 알리는 정책, 설명 문구의 맥락 변경 | 프론트 컴포넌트, 서버리스 함수, 다국어, SEO, 서비스워커, SAM 템플릿 | 배포와 환경변수, 크론 주기, 애드센스·서치콘솔, 보안 헤더 일괄 적용, SNS 반응 확인 |

## Known Issues

- 로컬판(`backend/`)과 배포판(`api/`)에 점수 로직이 복제되어 어긋남. 로컬판은 지표 5개만 합산
- 프론트 상수의 레드라인 값이 API와 다름
- 히스토리의 지지율은 현재값으로 고정, 실시간은 선물·히스토리는 현물 지수
- 지지율 스크래핑이 깨지면 조용히 기본값 41.3으로 떨어짐
- 테스트 없음. 푸시 발송이 직렬 루프

## Getting Started

```bash
npm run install:all
npm run dev
```

`backend/.env`에 `FRED_API_KEY`가 필요합니다. 프론트 `localhost:5173`, 백엔드 `localhost:8000`.

배포판 환경변수: `REDIS_URL`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `VITE_VAPID_PUBLIC_KEY`, `CRON_SECRET`, `OPENAI_API_KEY`. VAPID 키는 `scripts/generate-vapid.py`로 생성합니다.

## Retrospective

지정학적 리스크를 점수라는 언어로 번역해 보는 경험이 가장 값졌습니다. 동시에 코딩이 AI 시대로 넘어갔다는 것을 처음 체감했고, 빨리 만든 대가로 두 벌의 백엔드가 어긋난 채 배포된 것도 봤습니다. 이 경험이 [My_WIKI](https://github.com/accidentable/My_WIKI)를 만든 계기입니다.
