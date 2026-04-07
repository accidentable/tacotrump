import type { TranslationKey } from './ko';

const en: Record<TranslationKey, string> = {
  // Risk levels
  'risk.level1.label': 'Safe',
  'risk.level2.label': 'Caution',
  'risk.level3.label': 'Warning',
  'risk.level4.label': 'Danger',
  'risk.level1.desc': 'Market stable. Trump riding high. Likely to maintain hardline stance.',
  'risk.level2.desc': 'Market starting to wobble. Further escalation possible.',
  'risk.level3.desc': 'Market pressure building. Getting ready to back down.',
  'risk.level4.desc': 'Market panic. Trump retreat (TACO) imminent.',
  'risk.helpTitle': 'Level Guide',
  'risk.scoreUnit': 'pts',
  'risk.imgAlt': 'TACO risk level {{level}} - {{label}}',

  // Redline / indicator labels
  'redline.sp500': 'E-mini S&P Futures Drawdown',
  'redline.vix': 'VIX Fear Index',
  'redline.treasury_10y': '10Y Treasury Yield',
  'redline.oil': 'Oil (WTI)',
  'redline.dollar_index': 'Dollar Index',
  'redline.gasoline': 'National Avg Gasoline',
  'redline.treasury_30y': '30Y Treasury Yield',
  'redline.russell2000': 'Russell 2000 Drawdown',
  'redline.approval_rating': 'Presidential Approval',

  // Indicator descriptions
  'desc.sp500.summary': 'An index tracking the top 500 U.S. companies. We monitor how far it has fallen from its 52-week high.',
  'desc.sp500.why': 'A big drop makes it harder for Trump to maintain his hardline stance. A classic TACO signal.',
  'desc.sp500.danger': 'A 15%+ decline signals serious market instability.',
  'desc.vix.summary': "A number that measures investor fear. Also known as 'Wall Street's fear thermometer.'",
  'desc.vix.why': 'Hawkish news like wars or sanctions can send this number soaring instantly.',
  'desc.vix.danger': 'Above 35 means extreme market anxiety.',
  'desc.treasury_10y.summary': 'The interest rate when the U.S. government borrows money for 10 years. The benchmark for all rates.',
  'desc.treasury_10y.why': 'When oil prices rise due to conflict, inflation and rates follow. A burden for Trump.',
  'desc.treasury_10y.danger': 'Above 4.5% means heavy interest burden on businesses and households.',
  'desc.oil.summary': 'International crude oil price. The baseline for fuel costs we all pay.',
  'desc.oil.why': 'When Middle East tensions rise, oil supply takes a direct hit and prices surge. A key TACO pressure indicator.',
  'desc.oil.danger': 'Above $100/barrel drives up prices across the board.',
  'desc.dollar_index.summary': 'A number showing how strong the dollar is compared to other currencies.',
  'desc.dollar_index.why': 'During geopolitical crises, safe-haven demand for dollars can cause wild swings.',
  'desc.dollar_index.danger': 'Above 110 means the dollar is too strong, hurting exports and emerging markets.',
  'desc.approval_rating.summary': 'The U.S. presidential approval rating. A key clue for predicting policy direction.',
  'desc.approval_rating.why': 'When approval drops, it becomes harder to stick to a hardline. TACO probability rises.',
  'desc.approval_rating.danger': 'Below 35% significantly increases the chance of policy reversal.',
  'desc.gasoline.summary': 'Average gasoline price across the U.S. A consumer-felt inflation thermometer.',
  'desc.gasoline.why': 'Rising gas prices freeze consumer spending and drag down approval ratings.',
  'desc.gasoline.danger': 'Above $4/gallon means a major household burden.',
  'desc.treasury_30y.summary': 'The 30-year U.S. government bond yield. Reflects long-term economic outlook.',
  'desc.treasury_30y.why': 'Rising long-term rates push up mortgage interest rates too.',
  'desc.treasury_30y.danger': 'Above 5.5% creates a major long-term burden on the economy.',
  'desc.russell2000.summary': 'An index of 2,000 U.S. small-cap stocks. More sensitive to economic shifts than large-caps.',
  'desc.russell2000.why': 'Small companies with less resilience are the first to feel the impact of uncertainty.',
  'desc.russell2000.danger': 'A 25%+ drop means small businesses are in serious trouble.',

  // Header
  'header.lightMode': 'Switch to light mode',
  'header.darkMode': 'Switch to dark mode',
  'header.pushOff': 'Disable notifications',
  'header.pushOn': 'Enable notifications',
  'header.pushGuideIOS': 'To receive notifications on iPhone,\ntap "Add to Home Screen" first, then enable in the app.',
  'header.pushGuideDefault': 'Push notifications are not supported in this browser.\nPlease use Chrome or add to home screen.',
  'header.confirm': 'OK',
  'header.langToggle': 'Switch language',

  // IndicatorCard
  'market.sp500': 'Updates: Sun-Fri ~23hrs (E-mini Futures)',
  'market.treasury_10y': 'Updates: Mon-Fri 22:00-07:00 (KST)',
  'market.vix': 'Updates: Mon-Fri 22:30-05:00 (KST)',
  'indicator.redlineNear': 'Near redline',
  'indicator.warningLevel': 'Warning level',
  'indicator.tacoGauge': 'TACO Gauge',
  'indicator.learnMore': 'Learn more',
  'indicator.whyImportant': 'Why it matters',
  'indicator.redlineLabel': 'Redline',

  // Sections
  'section.coreIndicators': 'Key Indicators',
  'section.extendedIndicators': 'Extended Indicators',
  'section.countSuffix': '{{n}}',

  // Share
  'share.viral1': '🌮 Chances Trump chickens out? Very Low!\nMarket stable → Holding firm... Calm before the storm?\n👉 Check the live TACO Index',
  'share.viral2': '🌮 Chances Trump chickens out? Low\nMarket starting to wobble...\n👉 Check the live TACO Index',
  'share.viral3': '🌮 Chances Trump chickens out? High!\nMarket pressure building. Getting ready to back down lol\n👉 Check the live TACO Index',
  'share.viral4': '🚨 Chances Trump chickens out? Very High!!\nMarket panic → Retreat imminent 🌮🌮🌮\n👉 Check the live TACO Index',
  'share.title': 'TACO Index – Will Trump Chicken Out?',
  'share.button': 'Share',
  'share.copied': 'Link copied!',

  // Notification CTA
  'noti.guideIOS': 'iPhone: Tap Share (\u2B06) at bottom → "Add to Home Screen" → Enable notifications in app',
  'noti.guideChrome': 'Use Chrome browser to receive notifications.',
  'noti.close': 'Close',
  'noti.doneTitle': 'Notifications enabled!',
  'noti.title': 'Get TACO level change alerts',
  'noti.doneDesc': "We'll notify you when the risk level changes.",
  'noti.desc': "Get instant alerts when the TACO Index shifts.",
  'noti.enable': 'Enable',

  // Footer
  'footer.disclaimer': 'Disclaimer',
  'footer.disclaimerText': 'This dashboard is for educational and informational purposes only and does not constitute investment advice or political prediction. Displayed data and scores are automatically calculated from publicly available market data, and accuracy or completeness is not guaranteed.',

  // TruthFeed
  'time.justNow': 'Just now',
  'time.minutesAgo': '{{n}}m ago',
  'time.hoursAgo': '{{n}}h ago',
  'time.daysAgo': '{{n}}d ago',
  'truth.noData': 'Unable to load data',

  // HistoryTimeline
  'history.title': 'Risk Trend',
  'history.now': 'Now',
  'history.loading': 'Collecting data...',
  'history.totalScore': 'Total Score',

  // GaugeBar
  'gauge.safe': 'Safe',
  'gauge.redline': 'Redline',

  // App
  'app.lastUpdate': 'Last update',

  // Legal pages — common
  'legal.backToMain': 'Back',
  'legal.lastUpdated': 'Last updated: April 7, 2026',

  // About
  'about.title': 'About TACO Index',
  'about.heroTitle': 'Trump Always Chickens Out',
  'about.heroDesc': 'TACO Index is a real-time dashboard that tracks the probability of the Trump administration backing down on hardline policies due to market pressure.',
  'about.whatTitle': 'What is the TACO Index?',
  'about.whatDesc': 'TACO stands for "Trump Always Chickens Out." When President Trump announces aggressive foreign or trade policies, financial markets react sharply. But when market pressure crosses a certain threshold, a pattern of policy reversal has repeatedly emerged. The TACO Index quantifies this pattern using 6 key economic indicators.',
  'about.howTitle': 'How does it work?',
  'about.howDesc': 'We monitor 6 core indicators in real-time: S&P 500 Futures, VIX Fear Index, 10-Year Treasury Yield, Oil Price, Dollar Index, and Presidential Approval Rating. Each indicator has a safe zone and a redline. The current value is converted to a 0–1 score based on proximity to the redline. The combined score (max 6.0) determines one of 4 risk levels.',
  'about.levelTitle': '4 Risk Levels',
  'about.level1': 'Lv.1 Safe (0–1.7 pts): Market stable. High chance of maintaining hardline stance.',
  'about.level2': 'Lv.2 Caution (1.8–2.9 pts): Market starting to wobble. Escalation possible.',
  'about.level3': 'Lv.3 Warning (3.0–4.1 pts): Market pressure building. Preparing to back down.',
  'about.level4': 'Lv.4 Danger (4.2–6.0 pts): Market panic. Policy reversal imminent.',
  'about.dataTitle': 'Data Sources',
  'about.dataDesc': 'All market data is fetched in real-time from the Yahoo Finance API. Presidential approval ratings come from RealClearPolitics. Data refreshes approximately every 30 seconds.',
  'about.purposeTitle': 'Why we built this',
  'about.purposeDesc': 'We created this so anyone can intuitively understand how political events impact financial markets. The goal is to distill complex economic indicators into a single score that shows "how anxious the market is right now" at a glance. This is an educational and informational tool, not investment advice.',
  'about.contactTitle': 'Contact',
  'about.contactDesc': 'This service is independently operated. Feedback is welcome via Threads (@findawesomething).',

  // Privacy Policy
  'privacy.title': 'Privacy Policy',
  'privacy.introTitle': 'Overview',
  'privacy.introDesc': 'TACO Index ("Service") values your privacy and complies with applicable regulations. This Privacy Policy explains what information we collect and how we use it.',
  'privacy.collectTitle': 'Information We Collect',
  'privacy.collect1': 'Push notification subscriptions: If you enable notifications, we store the browser-generated subscription endpoint (URL) and encryption keys. We do not collect personally identifiable information such as names or email addresses.',
  'privacy.collect2': 'API key registration: If you apply for a developer API key, we store your email address and app name.',
  'privacy.collect3': 'Automatically collected information: Vercel Analytics collects anonymized page views, visitor country, and browser information. IP addresses are not stored.',
  'privacy.collect4': 'Cookies: We use minimal cookies for site operation (theme and language preferences). Third-party advertising services (Google AdSense) may use cookies for ad personalization.',
  'privacy.useTitle': 'How We Use Information',
  'privacy.use1': 'Sending push notifications (when risk level changes)',
  'privacy.use2': 'API key issuance and usage management',
  'privacy.use3': 'Anonymous statistical analysis for service improvement',
  'privacy.use4': 'Providing advertising services (Google AdSense)',
  'privacy.thirdTitle': 'Third-Party Services',
  'privacy.third1': 'Google AdSense: Uses cookies to display ads. Google\'s Privacy Policy (policies.google.com/privacy) applies.',
  'privacy.third2': 'Vercel Analytics: Collects anonymized visit statistics.',
  'privacy.third3': 'Yahoo Finance: Used to fetch market data. No user information is transmitted.',
  'privacy.retentionTitle': 'Retention & Deletion',
  'privacy.retentionDesc': 'Push subscription data is deleted immediately upon unsubscription. API key information is deleted within 30 days of key revocation. Anonymous statistical data is retained for 90 days from collection.',
  'privacy.rightsTitle': 'Your Rights',
  'privacy.rightsDesc': 'You can disable push notifications, revoke API keys, or delete cookies at any time. For privacy inquiries, contact us via Threads (@findawesomething).',
  'privacy.adsTitle': 'Advertising',
  'privacy.adsDesc': 'This service displays ads through Google AdSense. Google may use cookies to provide interest-based advertising. You can manage personalized ads at Google Ad Settings (adssettings.google.com).',

  // Terms of Service
  'terms.title': 'Terms of Service',
  'terms.introTitle': 'Service Overview',
  'terms.introDesc': 'TACO Index ("Service") is a web dashboard that visualizes policy risk from the Trump administration based on real-time market data. These terms govern your use of the Service.',
  'terms.disclaimerTitle': 'Disclaimer',
  'terms.disclaimer1': 'This Service is created for educational and informational purposes only and does not constitute investment advice, financial consultation, or political prediction.',
  'terms.disclaimer2': 'All displayed data and scores are automatically calculated from publicly available market data. Accuracy and completeness are not guaranteed.',
  'terms.disclaimer3': 'The operator assumes no responsibility for investment or other decisions made based on information displayed in the Service.',
  'terms.disclaimer4': 'Data may be delayed or inaccurate due to outages at market data providers (Yahoo Finance, etc.).',
  'terms.useTitle': 'Usage Rules',
  'terms.use1': 'The Service is free to use for personal, non-commercial purposes.',
  'terms.use2': 'API data access requires a valid API key, and daily usage limits must be observed.',
  'terms.use3': 'Automated mass scraping of the Service is not permitted.',
  'terms.use4': 'If redistributing data from the Service, the source (tacotrump.space) must be credited.',
  'terms.ipTitle': 'Intellectual Property',
  'terms.ipDesc': 'The TACO Index scoring methodology, design, and content belong to the operator. The underlying data sources belong to their respective providers.',
  'terms.changeTitle': 'Changes to Terms',
  'terms.changeDesc': 'These terms may be updated as needed. Changes take effect upon posting on the site.',
  'terms.contactTitle': 'Contact',
  'terms.contactDesc': 'For service inquiries, contact us via Threads (@findawesomething).',
};

export default en;
