// TACO 위젯 — Scriptable (iOS)
// 홈 화면에서 실시간 TACO 지수를 확인하세요.
// Small / Medium 위젯 지원

const API_URL = "https://tacotrump.space/api/widget";
const SITE_URL = "https://tacotrump.space";
const CACHE_FILE = "taco-widget-cache.json";

// ── 데이터 로드 ─────────────────────────────────────────
async function loadData() {
  try {
    const req = new Request(API_URL);
    req.timeoutInterval = 10;
    const json = await req.loadJSON();
    // 캐시 저장
    const fm = FileManager.local();
    const path = fm.joinPath(fm.documentsDirectory(), CACHE_FILE);
    fm.writeString(path, JSON.stringify(json));
    return json;
  } catch {
    // 오프라인 → 캐시
    const fm = FileManager.local();
    const path = fm.joinPath(fm.documentsDirectory(), CACHE_FILE);
    if (fm.fileExists(path)) {
      return JSON.parse(fm.readString(path));
    }
    return null;
  }
}

// ── 위젯 빌드 ───────────────────────────────────────────
function createWidget(data, family) {
  const w = new ListWidget();
  w.url = SITE_URL;

  // 배경색 (다크 톤)
  w.backgroundColor = new Color("#0E1116");
  w.setPadding(14, 14, 14, 14);

  if (!data) {
    const err = w.addText("데이터 로드 실패");
    err.font = Font.mediumSystemFont(13);
    err.textColor = Color.gray();
    return w;
  }

  const levelColor = new Color(data.color);

  // 상단: TACO + 레벨 배지
  const header = w.addStack();
  header.layoutHorizontally();
  header.centerAlignContent();

  const title = header.addText("TACO");
  title.font = Font.boldSystemFont(14);
  title.textColor = Color.white();

  header.addSpacer();

  const badge = header.addText(`Lv.${data.level} ${data.label}`);
  badge.font = Font.semiboldSystemFont(11);
  badge.textColor = levelColor;

  w.addSpacer(6);

  // 점수
  const scoreText = w.addText(`${data.score.toFixed(1)}`);
  scoreText.font = Font.boldSystemFont(36);
  scoreText.textColor = levelColor;
  scoreText.centerAlignText();

  const maxText = w.addText(`/ ${data.max.toFixed(1)}`);
  maxText.font = Font.mediumSystemFont(11);
  maxText.textColor = Color.gray();
  maxText.centerAlignText();

  w.addSpacer(4);

  // Medium 위젯: 상위 지표 표시
  if (family !== 0 && data.top_indicators && data.top_indicators.length > 0) {
    const sep = w.addStack();
    sep.layoutHorizontally();
    sep.addSpacer();
    const line = sep.addText("─────────");
    line.font = Font.mediumSystemFont(8);
    line.textColor = new Color("#333");
    sep.addSpacer();

    w.addSpacer(4);

    for (const ind of data.top_indicators.slice(0, 3)) {
      const row = w.addStack();
      row.layoutHorizontally();
      row.centerAlignContent();

      const label = row.addText(ind.label);
      label.font = Font.mediumSystemFont(11);
      label.textColor = new Color("#999");
      label.lineLimit = 1;

      row.addSpacer();

      const val = row.addText(`${ind.value}`);
      val.font = Font.semiboldSystemFont(11);
      val.textColor = Color.white();

      w.addSpacer(2);
    }
  }

  w.addSpacer();

  // 하단: 업데이트 시간
  const time = data.updated_at.replace("T", " ").slice(0, 16);
  const foot = w.addText(time);
  foot.font = Font.mediumSystemFont(9);
  foot.textColor = Color.gray();
  foot.rightAlignText();

  return w;
}

// ── 실행 ─────────────────────────────────────────────────
const data = await loadData();
const family = config.widgetFamily === "medium" ? 1 : 0;
const widget = createWidget(data, family);

if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  // 앱에서 직접 실행 시 미리보기
  if (family === 1) {
    widget.presentMedium();
  } else {
    widget.presentSmall();
  }
}

Script.complete();
