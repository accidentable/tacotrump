const ko = {
  // Risk levels
  'risk.level1.label': '안전',
  'risk.level2.label': '주의',
  'risk.level3.label': '경고',
  'risk.level4.label': '위험',
  'risk.level1.desc': '시장 안정. 트럼프 자신감 충전 중. 강경 기조 유지 확률 높음.',
  'risk.level2.desc': '시장이 흔들리기 시작. 추가 에스컬레이션 가능성.',
  'risk.level3.desc': '시장 압박 거세지는 중. 슬슬 물러날 준비.',
  'risk.level4.desc': '시장 패닉. 트럼프 후퇴(타코) 임박.',
  'risk.helpTitle': '레벨 기준',
  'risk.scoreUnit': '점',
  'risk.imgAlt': '타코 위험도 레벨 {{level}} - {{label}}',

  // Redline / indicator labels
  'redline.sp500': 'E-mini S&P 선물 고점대비 하락률',
  'redline.vix': 'VIX 공포지수',
  'redline.treasury_10y': '10년물 국채금리',
  'redline.oil': '유가 (브렌트)',
  'redline.dollar_index': '달러 인덱스',
  'redline.gasoline': '전국 평균 휘발유',
  'redline.treasury_30y': '30년물 국채금리',
  'redline.russell2000': 'Russell 2000 고점대비',
  'redline.approval_rating': '대통령 지지율',

  // Indicator descriptions
  'desc.sp500.summary': '미국 대표 500개 기업의 주가를 모아놓은 지수예요. 52주 최고점에서 얼마나 떨어졌는지를 봐요.',
  'desc.sp500.why': '이 숫자가 크게 떨어지면 트럼프가 강경 기조를 유지하기 어려워져요. 전형적인 타코 신호죠.',
  'desc.sp500.danger': '15% 이상 하락하면 시장이 많이 불안하다는 신호예요.',
  'desc.vix.summary': "투자자들이 느끼는 공포를 숫자로 나타낸 거예요. '월가의 공포 온도계'라고도 불러요.",
  'desc.vix.why': '전쟁·제재 같은 강경 뉴스가 나오면 이 숫자가 순식간에 치솟아요.',
  'desc.vix.danger': '35를 넘으면 시장이 극도로 불안한 상태예요.',
  'desc.treasury_10y.summary': '미국 정부가 10년간 돈을 빌릴 때 붙는 이자율이에요. 모든 금리의 기준이 돼요.',
  'desc.treasury_10y.why': '전쟁으로 유가가 오르면 물가·금리도 덩달아 올라요. 트럼프에겐 부담이죠.',
  'desc.treasury_10y.danger': '4.5%를 넘으면 기업과 가계 모두 이자 부담이 커져요.',
  'desc.oil.summary': '국제 원유 가격이에요. 우리가 쓰는 기름값을 결정하는 기준이에요.',
  'desc.oil.why': '중동 긴장이 고조되면 원유 공급이 직접 타격받아 가격이 급등해요. 타코 압력의 핵심 지표예요.',
  'desc.oil.danger': '배럴당 100달러를 넘으면 물가 전체가 올라요.',
  'desc.dollar_index.summary': '달러가 다른 나라 돈에 비해 얼마나 강한지 보여주는 숫자예요.',
  'desc.dollar_index.why': '지정학적 위기 때 안전자산으로 달러 수요가 몰리면서 급변할 수 있어요.',
  'desc.dollar_index.danger': '110을 넘으면 달러가 너무 강해서 수출과 신흥국에 부담이 돼요.',
  'desc.approval_rating.summary': '미국 대통령의 지지율이에요. 정책 방향을 점치는 데 중요한 단서예요.',
  'desc.approval_rating.why': '지지율이 떨어지면 강경 노선을 고집하기 어려워져요. 타코 확률이 올라가죠.',
  'desc.approval_rating.danger': '35% 아래로 내려가면 정책 변화 가능성이 높아져요.',
  'desc.gasoline.summary': '미국 전역의 평균 휘발유 가격이에요. 국민이 체감하는 물가 온도계예요.',
  'desc.gasoline.why': '기름값이 오르면 소비 심리가 얼어붙고 지지율도 떨어져요.',
  'desc.gasoline.danger': '갤런당 4달러를 넘으면 가계 부담이 크게 늘어나요.',
  'desc.treasury_30y.summary': '미국 정부의 30년짜리 장기 채권 금리예요. 장기 경제 전망을 보여줘요.',
  'desc.treasury_30y.why': '장기 금리가 오르면 주택담보대출 이자도 따라 올라요.',
  'desc.treasury_30y.danger': '5.5%를 넘으면 장기적으로 경제에 큰 부담이 돼요.',
  'desc.russell2000.summary': '미국 중소기업 2,000개의 주가를 모은 지수예요. 대기업보다 경기 변화에 더 민감해요.',
  'desc.russell2000.why': '불확실성의 영향을 가장 먼저 받는 건 체력이 약한 중소기업이에요.',
  'desc.russell2000.danger': '25% 이상 떨어지면 중소기업들이 심각한 어려움을 겪고 있다는 뜻이에요.',

  // Header
  'header.lightMode': '라이트 모드로 전환',
  'header.darkMode': '다크 모드로 전환',
  'header.pushOff': '알림 해제',
  'header.pushOn': '알림 켜기',
  'header.pushGuideIOS': '아이폰에서 알림을 받으려면\n"홈 화면에 추가" 후 앱에서 다시 눌러주세요.',
  'header.pushGuideDefault': '이 브라우저에서는 푸시 알림이 지원되지 않습니다.\nChrome 또는 홈 화면에 추가 후 이용해주세요.',
  'header.confirm': '확인',
  'header.langToggle': '언어 전환',

  // IndicatorCard
  'market.sp500': '업데이트: 일~금 거의 23시간 (E-mini 선물)',
  'market.treasury_10y': '업데이트: 월~금 22:00 ~ 07:00 (한국시간)',
  'market.vix': '업데이트: 월~금 22:30 ~ 05:00 (한국시간)',
  'indicator.redlineNear': '레드라인 임박',
  'indicator.warningLevel': '경고 수준',
  'indicator.tacoGauge': '타코 게이지',
  'indicator.learnMore': '더 알아보기',
  'indicator.whyImportant': '왜 중요해요?',
  'indicator.redlineLabel': '레드라인',

  // Sections
  'section.coreIndicators': '핵심 지표',
  'section.extendedIndicators': '확장 지표',
  'section.countSuffix': '{{n}}개',

  // Share
  'share.viral1': '🌮 트럼프가 타코할 확률은? 매우 낮음!\n시장 안정 → 강경 기조 유지 중… 폭풍 전의 고요?\n👉 실시간 타코 지수 확인하기',
  'share.viral2': '🌮 트럼프가 타코할 확률은? 낮음\n시장이 슬슬 흔들리는 낌새…\n👉 실시간 타코 지수 확인하기',
  'share.viral3': '🌮 트럼프가 타코할 확률은? 높음!\n시장 압박에 슬슬 물러날 준비 중 ㅋㅋ\n👉 실시간 타코 지수 확인하기',
  'share.viral4': '🚨 트럼프가 타코할 확률은? 매우 높음!!\n시장 패닉 → 후퇴(타코) 임박 🌮🌮🌮\n👉 실시간 타코 지수 확인하기',
  'share.title': '타코알리미 – 트럼프 타코 확률은?',
  'share.button': '공유하러 가기',
  'share.copied': '링크 복사됨!',

  // Notification CTA
  'noti.guideIOS': '아이폰: Safari 하단 공유(\u2B06) → "홈 화면에 추가" → 앱에서 알림 켜기',
  'noti.guideChrome': 'Chrome 브라우저에서 접속하면 알림을 받을 수 있어요.',
  'noti.close': '닫기',
  'noti.doneTitle': '알림 설정 완료!',
  'noti.title': '타코 레벨 변경 알림 받기',
  'noti.doneDesc': '위험 레벨이 바뀌면 알려드릴게요.',
  'noti.desc': 'TACO 지수가 급변하면 즉시 알림을 보내드려요.',
  'noti.enable': '켜기',

  // Footer
  'footer.disclaimer': '면책사항',
  'footer.disclaimerText': '본 대시보드는 교육 및 정보 제공 목적으로만 제작되었으며, 투자 조언이나 정치적 예측을 구성하지 않습니다. 표시된 데이터와 점수는 공개된 시장 데이터를 기반으로 자동 산출된 것이며, 정확성이나 완전성을 보장하지 않습니다.',

  // TruthFeed
  'time.justNow': '방금 전',
  'time.minutesAgo': '{{n}}분 전',
  'time.hoursAgo': '{{n}}시간 전',
  'time.daysAgo': '{{n}}일 전',
  'truth.noData': '데이터를 불러올 수 없습니다',

  // HistoryTimeline
  'history.title': '위험도 추이',
  'history.now': '지금',
  'history.loading': '데이터 수집 중...',
  'history.totalScore': '종합 점수',

  // GaugeBar
  'gauge.safe': '안전',
  'gauge.redline': '레드라인',

  // App
  'app.lastUpdate': '최근 업데이트',
} as const;

export type TranslationKey = keyof typeof ko;
export default ko;
