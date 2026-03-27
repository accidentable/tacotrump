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
        <h2 className="text-lg font-bold text-text-primary mb-4">
          핵심 지표
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="toss-card p-5 animate-pulse">
              <div className="h-28 bg-bg-card-hover rounded-xl" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-lg font-bold text-text-primary mb-4">
        핵심 지표
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {indicators.map(ind => (
          <IndicatorCard key={ind.key} indicator={ind} />
        ))}
      </div>
    </section>
  );
}
