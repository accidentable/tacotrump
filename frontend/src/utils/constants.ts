export const RISK_LEVELS = {
  1: { label: '안전', color: '#16A34A', bg: '#F0FDF4', border: '#BBF7D0' },
  2: { label: '주의', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
  3: { label: '경고', color: '#EA580C', bg: '#FFF7ED', border: '#FED7AA' },
  4: { label: '위험', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
} as const;

export const REDLINES = {
  sp500: { value: -20, direction: 'below' as const, label: 'E-mini S&P 선물 고점대비 하락률', unit: '%' },
  vix: { value: 35, direction: 'above' as const, label: 'VIX 공포지수', unit: '' },
  treasury_10y: { value: 5.0, direction: 'above' as const, label: '10년물 국채금리', unit: '%' },
  oil: { value: 120, direction: 'above' as const, label: '유가 (브렌트)', unit: '$/bbl' },
  dollar_index: { value: 115, direction: 'above' as const, label: '달러 인덱스', unit: '' },
  gasoline: { value: 4.0, direction: 'above' as const, label: '전국 평균 휘발유', unit: '$/gal' },
  treasury_30y: { value: 5.5, direction: 'above' as const, label: '30년물 국채금리', unit: '%' },
  russell2000: { value: -25, direction: 'below' as const, label: 'Russell 2000 고점대비', unit: '%' },
  approval_rating: { value: 35, direction: 'below' as const, label: '대통령 지지율', unit: '%' },
};

export const API_BASE = '/api';
export const WS_URL = import.meta.env.DEV
  ? `ws://${window.location.hostname}:8000/ws/realtime`
  : null; // 서버리스 환경에서는 WebSocket 비활성화
