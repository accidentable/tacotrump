import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { IndicatorData } from '../utils/riskCalculator';
import IndicatorCard from './IndicatorCard';
import { useI18n } from '../i18n';

interface ExtendedIndicatorsProps {
  indicators: IndicatorData[];
}

export default function ExtendedIndicators({ indicators }: ExtendedIndicatorsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useI18n();

  if (indicators.length === 0) return null;

  return (
    <section>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-lg font-bold text-text-primary mb-4 w-full text-left hover:text-accent transition-colors"
      >
        {isOpen ? (
          <ChevronDown className="w-5 h-5" />
        ) : (
          <ChevronRight className="w-5 h-5" />
        )}
        {t('section.extendedIndicators')}
        <span className="text-sm font-normal text-text-muted ml-1">
          {t('section.countSuffix', { n: indicators.length })}
        </span>
      </button>

      {isOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {indicators.map(ind => (
            <IndicatorCard key={ind.key} indicator={ind} />
          ))}
        </div>
      )}
    </section>
  );
}
