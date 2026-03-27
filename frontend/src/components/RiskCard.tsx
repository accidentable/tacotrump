import { useState, useEffect } from 'react';
import { HelpCircle, X } from 'lucide-react';
import type { RiskData } from '../utils/riskCalculator';
import GaugeBar from './GaugeBar';
import { RISK_LEVELS } from '../utils/constants';

interface RiskCardProps {
  risk: RiskData | null;
  loading: boolean;
}

const ALL_IMAGES = [
  '/level1_1.png', '/level1_2.png',
  '/level2_2.png',
  '/level3_1.png', '/level3_2.png',
  '/level4_1.png', '/level4_2.png',
  '/print1.png', '/print2.png',
];

const LEVEL_INFO = [
  { lv: 1, label: '안전', color: '#16A34A', range: '0.0 – 1.7', desc: '시장 안정. 트럼프 자신감 충전 중. 새로운 사고를 칠 확률이 높은 구간.' },
  { lv: 2, label: '주의', color: '#D97706', range: '1.8 – 2.9', desc: '시장이 버티는 중. 추가 강경책 가능성 있음.' },
  { lv: 3, label: '경고', color: '#EA580C', range: '3.0 – 4.1', desc: '시장 흔들리는 중. 슬슬 꼬리 내릴 준비.' },
  { lv: 4, label: '위험', color: '#DC2626', range: '4.2 – 6.0', desc: '시장 패닉. 정책 번복 임박.' },
];

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function RiskCard({ risk, loading }: RiskCardProps) {
  const [imgSrc, setImgSrc] = useState('');
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    if (!risk) return;
    setImgSrc(pickRandom(ALL_IMAGES));
  }, [risk?.level]);

  if (loading || !risk) {
    return (
      <div className="bg-bg-card border border-border rounded-lg p-6 animate-pulse max-w-sm mx-auto">
        <div className="h-80 bg-bg-card-hover rounded" />
      </div>
    );
  }

  const level = RISK_LEVELS[risk.level as keyof typeof RISK_LEVELS] || RISK_LEVELS[1];
  const gaugePercent = (risk.total_score / risk.max_score) * 100;

  return (
    <div
      className="bg-bg-card border rounded-lg max-w-sm mx-auto relative"
      style={{ borderColor: level.border }}
    >
      {/* 상단 색상 바 */}
      <div className="h-1.5 rounded-t-lg" style={{ backgroundColor: level.color }} />

      {/* 정보 영역 */}
      <div className="p-4">
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-center gap-1.5">
            <span className="text-2xl font-bold tabular-nums" style={{ color: level.color }}>
              Lv.{risk.level}
            </span>
            <span className="text-base font-semibold" style={{ color: level.color }}>
              {level.label}
            </span>
            <div className="relative">
              <button
                onClick={() => setShowHelp(!showHelp)}
                className="text-text-muted hover:text-text-primary transition-colors ml-0.5"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              {/* 풍선 팝오버 */}
              {showHelp && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowHelp(false)} />
                  <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-72 bg-bg-card border border-border rounded-lg shadow-lg p-3 animate-in">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-text-primary">레벨 기준</span>
                      <button onClick={() => setShowHelp(false)} className="text-text-muted hover:text-text-primary">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {LEVEL_INFO.map(info => (
                        <div
                          key={info.lv}
                          className="flex gap-2 items-start text-xs"
                          style={{ opacity: info.lv === risk.level ? 1 : 0.55 }}
                        >
                          <div className="shrink-0 w-20">
                            <span className="font-bold" style={{ color: info.color }}>
                              Lv.{info.lv} {info.label}
                            </span>
                            <span className="block text-[10px] text-text-muted">{info.range}점</span>
                          </div>
                          <span className="text-text-secondary">{info.desc}</span>
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

        <p className="text-sm font-bold text-text-primary leading-snug mt-3">
          {risk.description}
        </p>
      </div>

      {/* 이미지 */}
      <div style={{ backgroundColor: level.bg }}>
        <img
          src={imgSrc}
          alt={`타코 위험도 레벨 ${risk.level} - ${level.label}`}
          loading="lazy"
          decoding="async"
          className="w-full object-cover rounded-b-lg"
        />
      </div>
    </div>
  );
}
