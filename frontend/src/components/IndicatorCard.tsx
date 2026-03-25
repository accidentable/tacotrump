import { TrendingUp, TrendingDown, Minus, Landmark, Fuel, DollarSign, Users, BarChart3 } from 'lucide-react';
import type { IndicatorData } from '../utils/riskCalculator';
import { calculateGaugePercent, getGaugeColor } from '../utils/riskCalculator';
import GaugeBar from './GaugeBar';

interface IndicatorCardProps {
  indicator: IndicatorData;
}

// 한국시간 기준 업데이트 시간 안내
const MARKET_HOURS: Record<string, string> = {
  sp500: '업데이트: 월~금 22:30 ~ 05:00 (한국시간, 서머타임)',
  treasury_10y: '업데이트: 월~금 22:30 ~ 05:00 (한국시간, 서머타임)',
  treasury_30y: '업데이트: 월~금 22:30 ~ 05:00 (한국시간, 서머타임)',
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  sp500: BarChart3,
  treasury_10y: Landmark,
  oil: Fuel,
  dollar_index: DollarSign,
  gasoline: Fuel,
  treasury_30y: Landmark,
  russell2000: BarChart3,
  approval_rating: Users,
};

export default function IndicatorCard({ indicator }: IndicatorCardProps) {
  const { key, label, value, change, change_pct, unit, redline, redline_direction, score } = indicator;

  const Icon = ICON_MAP[key] || BarChart3;

  const isPositive = (change ?? 0) > 0;
  const isNegative = (change ?? 0) < 0;
  const changeColor = isPositive ? '#16A34A' : isNegative ? '#DC2626' : '#8899A6';
  const ChangeIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  const gaugePercent = redline != null
    ? calculateGaugePercent(value, redline, redline_direction)
    : score * 100;

  const gaugeColor = getGaugeColor(gaugePercent);

  const formatValue = (v: number) => {
    if (Math.abs(v) >= 1000) return v.toLocaleString('en-US', { maximumFractionDigits: 1 });
    return v.toFixed(2);
  };

  return (
    <div className="bg-bg-card border border-border rounded-lg p-4 hover:shadow-sm transition-shadow">
      {/* Header */}
      <div className="mb-3 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-accent" />
          <span className="text-sm text-text-secondary font-medium">{label}</span>
          {gaugePercent >= 85 && <span title="레드라인 임박">🔴</span>}
          {gaugePercent >= 66 && gaugePercent < 85 && <span title="경고 수준">🟠</span>}
        </div>
        {MARKET_HOURS[key] && (
          <p className="text-[10px] text-text-muted mt-1 ml-6">{MARKET_HOURS[key]}</p>
        )}
      </div>

      {/* Value + Change */}
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-baseline gap-1.5">
          <span className="text-2xl font-bold tabular-nums text-text-primary">
            {formatValue(value)}
          </span>
          <span className="text-xs text-text-muted">{unit}</span>
        </div>
        <div className="flex items-center gap-1">
          <ChangeIcon className="w-3.5 h-3.5" style={{ color: changeColor }} />
          <span className="text-xs font-medium tabular-nums" style={{ color: changeColor }}>
            {isPositive ? '+' : ''}{(change ?? 0).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Gauge */}
      <div>
        <div className="flex justify-between text-[11px] text-text-muted mb-1">
          <span>타코 게이지</span>
          <span className="font-medium" style={{ color: gaugeColor }}>
            {gaugePercent.toFixed(0)}%
          </span>
        </div>
        <GaugeBar percent={gaugePercent} height={4} />
        <div className="text-right mt-0.5">
          <span className="text-[10px] text-text-muted">
            레드라인: {redline != null ? `${redline}${unit}` : '-'}
          </span>
        </div>
      </div>
    </div>
  );
}
