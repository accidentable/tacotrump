import { getGaugeColor } from '../utils/riskCalculator';

interface GaugeBarProps {
  percent: number;
  height?: number;
  showLabel?: boolean;
}

export default function GaugeBar({ percent, height = 6, showLabel = false }: GaugeBarProps) {
  const clampedPercent = Math.max(0, Math.min(100, percent));
  const color = getGaugeColor(clampedPercent);

  return (
    <div className="w-full">
      <div
        className="w-full rounded-full overflow-hidden"
        style={{ height: `${height}px`, backgroundColor: 'var(--color-border)' }}
      >
        <div
          className="h-full rounded-full gauge-animated transition-all duration-700"
          style={{ width: `${clampedPercent}%`, backgroundColor: color }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between mt-1 text-[10px] text-text-muted">
          <span>안전</span>
          <span style={{ color }}>{clampedPercent.toFixed(0)}%</span>
          <span>레드라인</span>
        </div>
      )}
    </div>
  );
}
