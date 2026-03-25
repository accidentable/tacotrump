import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { IndicatorData } from '../utils/riskCalculator';
import IndicatorCard from './IndicatorCard';

interface ExtendedIndicatorsProps {
  indicators: IndicatorData[];
}

export default function ExtendedIndicators({ indicators }: ExtendedIndicatorsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (indicators.length === 0) return null;

  return (
    <section>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-sm font-semibold text-text-primary mb-3 border-b-2 border-border-strong pb-1.5 w-full text-left hover:text-accent transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        확장 지표 (Extended)
        <span className="text-xs font-normal text-text-muted ml-1">
          {indicators.length}개
        </span>
      </button>

      {isOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {indicators.map(ind => (
            <IndicatorCard key={ind.key} indicator={ind} />
          ))}
        </div>
      )}
    </section>
  );
}
