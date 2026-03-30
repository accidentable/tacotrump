import { useState, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';
import type { RiskData } from '../utils/riskCalculator';
import GaugeBar from './GaugeBar';
import { RISK_LEVELS } from '../utils/constants';
import { useI18n } from '../i18n';

interface RiskCardProps {
  risk: RiskData | null;
  loading: boolean;
}

const ALL_IMAGES = [
  '/level1_1.png', '/level1_2.png',
  '/level2_2.png',
  '/level3_1.png', '/level3_2.png',
  '/level4_1.png', '/level4_2.png',
  '/print1.png', '/print2.png', '/print3.png', '/print4.png', '/print5.png',
  '/print6.png', '/print7.png', '/print8.png', '/print9.png', '/print10.png',
];

const LEVEL_COLORS = ['#3CD5AF', '#FFC84C', '#F58737', '#F04452'];
const LEVEL_RANGES = ['0.0 – 1.7', '1.8 – 2.9', '3.0 – 4.1', '4.2 – 6.0'];

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function RiskCard({ risk, loading }: RiskCardProps) {
  const { t } = useI18n();
  const [imgSrc, setImgSrc] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!risk) return;
    setImgSrc(pickRandom(ALL_IMAGES));
  }, [risk?.level]);

  if (loading || !risk) {
    return (
      <div className="toss-card p-6 animate-pulse max-w-sm mx-auto">
        <div className="h-80 bg-bg-card-hover rounded-xl" />
      </div>
    );
  }

  const level = RISK_LEVELS[risk.level as keyof typeof RISK_LEVELS] || RISK_LEVELS[1];
  const gaugePercent = (risk.total_score / risk.max_score) * 100;
  const riskLabel = t(`risk.level${risk.level}.label` as 'risk.level1.label');

  return (
    <div className="toss-card max-w-sm mx-auto relative overflow-hidden">
      <div className="h-1.5" style={{ backgroundColor: level.color }} />

      <div className="p-5">
        <div className="flex items-baseline justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-4xl font-bold tabular-nums" style={{ color: level.color }}>
              Lv.{risk.level}
            </span>
            <span className="text-lg font-semibold" style={{ color: level.color }}>
              {riskLabel}
            </span>
            <div className="relative">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="text-text-muted hover:text-text-primary transition-colors ml-0.5"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {showHelp && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowHelp(false)} />
                  <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 toss-card p-4 animate-in">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-text-primary">{t('risk.helpTitle')}</span>
                      <button onClick={() => setShowHelp(false)} className="text-text-muted hover:text-text-primary">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2.5">
                      {[1, 2, 3, 4].map(lv => (
                        <div
                          key={lv}
                          className="flex gap-3 items-start text-xs"
                          style={{ opacity: lv === risk.level ? 1 : 0.5 }}
                        >
                          <div className="shrink-0 w-20">
                            <span className="font-bold" style={{ color: LEVEL_COLORS[lv - 1] }}>
                              Lv.{lv} {t(`risk.level${lv}.label` as 'risk.level1.label')}
                            </span>
                            <span className="block text-[10px] text-text-muted mt-0.5">
                              {LEVEL_RANGES[lv - 1]}{t('risk.scoreUnit')}
                            </span>
                          </div>
                          <span className="text-text-secondary leading-relaxed">
                            {t(`risk.level${lv}.desc` as 'risk.level1.desc')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <span className="text-xs text-text-muted">
            <span className="font-semibold text-text-primary">{risk.total_score.toFixed(1)}</span> / {risk.max_score.toFixed(1)}
          </span>
        </div>

        <GaugeBar percent={gaugePercent} height={6} />

        <p className="text-sm font-bold text-text-primary leading-snug mt-4">
          {t(`risk.level${risk.level}.desc` as 'risk.level1.desc')}
        </p>
      </div>

      <div style={{ backgroundColor: level.bg }}>
        <img
          src={imgSrc}
          alt={t('risk.imgAlt', { level: risk.level, label: riskLabel })}
          loading="lazy"
          decoding="async"
          className="w-full object-cover"
        />
      </div>
    </div>
  );
}
