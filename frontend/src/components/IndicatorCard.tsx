import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Landmark, Fuel, DollarSign, Users, BarChart3, Activity, ChevronDown } from 'lucide-react';

import type { IndicatorData } from '../utils/riskCalculator';
import { calculateGaugePercent, getGaugeColor } from '../utils/riskCalculator';
import { INDICATOR_DESCRIPTIONS } from '../utils/indicatorDescriptions';
import GaugeBar from './GaugeBar';

interface IndicatorCardProps {
  indicator: IndicatorData;
}

// 한국시간 기준 업데이트 시간 안내
const MARKET_HOURS: Record<string, string> = {
  sp500: '업데이트: 일~금 거의 23시간 (E-mini 선물)',
  treasury_10y: '업데이트: 월~금 22:00 ~ 07:00 (한국시간)',
  vix: '업데이트: 월~금 22:30 ~ 05:00 (한국시간)',
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  sp500: BarChart3,
  vix: Activity,
  treasury_10y: Landmark,
  oil: Fuel,
  dollar_index: DollarSign,
  gasoline: Fuel,
  treasury_30y: Landmark,
  russell2000: BarChart3,
  approval_rating: Users,
};

export default function IndicatorCard({ indicator }: IndicatorCardProps) {
  const { key, label, value, change, unit, redline, redline_direction, score } = indicator;
  const [showDetail, setShowDetail] = useState(false);

  const Icon = ICON_MAP[key] || BarChart3;
  const desc = INDICATOR_DESCRIPTIONS[key];

  const isPositive = (change ?? 0) > 0;
  const isNegative = (change ?? 0) < 0;
  const changeColor = isPositive ? '#3CD5AF' : isNegative ? '#F04452' : '#8B95A1';
  const ChangeIcon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

  const gaugePercent = redline != null
    ? calculateGaugePercent(value, redline, redline_direction, key)
    : score * 100;

  const gaugeColor = getGaugeColor(gaugePercent);

  const formatValue = (v: number) => {
    if (Math.abs(v) >= 1000) return v.toLocaleString('en-US', { maximumFractionDigits: 1 });
    return v.toFixed(2);
  };

  return (
    <div className="toss-card p-5">
      {/* Header */}
      <div className="mb-3">
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
      <div className="flex items-baseline justify-between mb-4">
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold tabular-nums text-text-primary">
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
        <div className="flex justify-between text-[11px] text-text-muted mb-1.5">
          <span>타코 게이지</span>
          <span className="font-medium" style={{ color: gaugeColor }}>
            {gaugePercent.toFixed(0)}%
          </span>
        </div>
        <GaugeBar percent={gaugePercent} height={6} />
        <div className="text-right mt-1">
          <span className="text-[10px] text-text-muted">
            레드라인: {redline != null ? `${redline}${unit}` : '-'}
          </span>
        </div>
      </div>

      {/* 더 알아보기 — Toss-style */}
      {desc && (
        <div className="mt-3 pt-3 border-t border-border">
          <button
            onClick={() => setShowDetail(!showDetail)}
            className="flex items-center gap-1 text-xs text-text-muted hover:text-accent transition-colors"
          >
            <span>더 알아보기</span>
            <ChevronDown
              className={`w-3 h-3 transition-transform duration-200 ${showDetail ? 'rotate-180' : ''}`}
            />
          </button>

          <div
            className={`grid transition-all duration-200 ease-out ${
              showDetail ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0'
            }`}
          >
            <div className="overflow-hidden">
              <div className="bg-bg-card-hover rounded-xl px-3 py-3 space-y-2.5">
                {/* 한 줄 설명 */}
                <p className="text-xs text-text-secondary leading-relaxed">
                  {desc.summary}
                </p>

                {/* 왜 중요해요 */}
                <div>
                  <span className="text-[10px] font-semibold text-accent">
                    왜 중요해요?
                  </span>
                  <p className="text-xs text-text-secondary leading-relaxed mt-0.5">
                    {desc.why}
                  </p>
                </div>

                {/* 위험 구간 */}
                <div className="flex items-start gap-1.5">
                  <span className="text-[10px] mt-px">⚠️</span>
                  <p className="text-[11px] text-text-muted leading-relaxed">
                    {desc.danger}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
