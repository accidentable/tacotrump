import { useState, useEffect } from 'react';
import type { RiskData } from '../utils/riskCalculator';
import GaugeBar from './GaugeBar';
import { RISK_LEVELS } from '../utils/constants';

interface RiskCardProps {
  risk: RiskData | null;
  loading: boolean;
}

// 레벨별 이미지 목록 — 파일 추가 시 여기에 추가만 하면 됨
const LEVEL_IMAGES: Record<number, string[]> = {
  1: ['/level1_1.png', '/level1_2.png'],
  2: ['/level2_1.png', '/level2_2.png'],
  3: ['/level3_1.png', '/level3_2.png'],
  4: ['/level4_1.png', '/level4_2.png'],
};

function pickRandom(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function RiskCard({ risk, loading }: RiskCardProps) {
  const [imgSrc, setImgSrc] = useState('');

  // 레벨이 바뀌거나 컴포넌트 마운트 시 랜덤 선택
  useEffect(() => {
    if (!risk) return;
    const images = LEVEL_IMAGES[risk.level] || LEVEL_IMAGES[1];
    setImgSrc(pickRandom(images));
  }, [risk?.level]);

  if (loading || !risk) {
    return (
      <div className="bg-bg-card border border-border rounded-lg p-6 animate-pulse max-w-md mx-auto">
        <div className="h-80 bg-bg-card-hover rounded" />
      </div>
    );
  }

  const level = RISK_LEVELS[risk.level as keyof typeof RISK_LEVELS] || RISK_LEVELS[1];
  const gaugePercent = (risk.total_score / risk.max_score) * 100;

  return (
    <div
      className="bg-bg-card border rounded-lg overflow-hidden max-w-md mx-auto"
      style={{ borderColor: level.border }}
    >
      {/* 상단 색상 바 */}
      <div className="h-1.5" style={{ backgroundColor: level.color }} />

      {/* 이미지 */}
      <div style={{ backgroundColor: level.bg }}>
        <img
          src={imgSrc}
          alt={`Level ${risk.level}`}
          className="w-full object-cover"
        />
      </div>

      {/* 하단 정보 영역 */}
      <div className="p-4">
        <div className="flex items-baseline justify-between mb-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tabular-nums" style={{ color: level.color }}>
              Lv.{risk.level}
            </span>
            <span className="text-base font-semibold" style={{ color: level.color }}>
              {level.label}
            </span>
          </div>
          <span className="text-xs text-text-muted">
            <span className="font-semibold text-text-primary">{risk.total_score.toFixed(1)}</span> / {risk.max_score.toFixed(1)}
          </span>
        </div>

        <GaugeBar percent={gaugePercent} height={6} />

        <p className="text-xs text-text-secondary leading-relaxed mt-3">
          {risk.description}
        </p>
      </div>
    </div>
  );
}
