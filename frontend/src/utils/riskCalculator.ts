export interface IndicatorData {
  key: string;
  label: string;
  value: number;
  prev_value?: number;
  change?: number;
  change_pct?: number;
  unit: string;
  redline?: number;
  redline_direction: 'above' | 'below';
  score: number;
  is_core: boolean;
}

export interface RiskData {
  level: number;
  label: string;
  color: string;
  total_score: number;
  max_score: number;
  description: string;
}

export interface HistoryEntry {
  timestamp: string;
  total_score: number;
  risk_level: number;
  sp500?: number;
  treasury_10y?: number;
  oil?: number;
  dollar_index?: number;
}

// safe zone 기준 — 백엔드와 동일
const SAFE_ZONES: Record<string, number> = {
  sp500: -3, vix: 15, treasury_10y: 4.0, oil: 75, dollar_index: 97, approval_rating: 50,
};

export function calculateGaugePercent(
  value: number,
  redline: number,
  direction: 'above' | 'below',
  key?: string
): number {
  const safe = key && SAFE_ZONES[key] != null ? SAFE_ZONES[key] : (direction === 'above' ? redline * 0.6 : 50);

  if (direction === 'above') {
    if (value <= safe) return 0;
    if (value >= redline) return 100;
    return ((value - safe) / (redline - safe)) * 100;
  } else {
    if (value >= safe) return 0;
    if (value <= redline) return 100;
    return ((safe - value) / (safe - redline)) * 100;
  }
}

export function getGaugeColor(percent: number): string {
  if (percent < 33) return '#16A34A';
  if (percent < 66) return '#D97706';
  if (percent < 85) return '#EA580C';
  return '#DC2626';
}
