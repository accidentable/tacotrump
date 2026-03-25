import type { IndicatorData } from '../utils/riskCalculator';
import IndicatorCard from './IndicatorCard';

interface IndicatorGridProps {
  indicators: IndicatorData[];
  loading: boolean;
}

export default function IndicatorGrid({ indicators, loading }: IndicatorGridProps) {
  if (loading) {
    return (
      <section>
        <h2 className="text-sm font-semibold text-text-primary mb-3 border-b-2 border-accent pb-1.5">
          핵심 지표 (Core Indicators)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-bg-card border border-border rounded-lg p-4 animate-pulse">
              <div className="h-28 bg-bg-card-hover rounded" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-sm font-semibold text-text-primary mb-3 border-b-2 border-accent pb-1.5">
        핵심 지표 (Core Indicators)
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {indicators.map(ind => (
          <IndicatorCard key={ind.key} indicator={ind} />
        ))}
      </div>
    </section>
  );
}
