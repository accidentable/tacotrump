import { Clock } from 'lucide-react';
import { RISK_LEVELS } from '../utils/constants';

interface HeaderProps {
  riskLevel: number;
  updatedAt: string;
}

export default function Header({ riskLevel, updatedAt }: HeaderProps) {
  const level = RISK_LEVELS[riskLevel as keyof typeof RISK_LEVELS] || RISK_LEVELS[1];

  const formatTime = (s: string) => {
    if (!s || s === 'N/A') return '--:--';
    // KST 제거하고 시간만 표시
    if (s.includes('KST')) return s.replace(' KST', '').trim();
    try {
      const d = new Date(s);
      if (isNaN(d.getTime())) return s;
      return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return s;
    }
  };

  return (
    <header className="bg-bg-header text-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-tight">
              TACO
            </h1>
            <span className="text-white/50 text-xs hidden sm:inline">|</span>
            <span className="text-white/60 text-sm hidden sm:inline">
              Trump Always Chickens Out
            </span>
          </div>

          <div
            className="px-2.5 py-1 rounded text-xs font-semibold border"
            style={{
              backgroundColor: level.bg,
              color: level.color,
              borderColor: level.border,
            }}
          >
            Lv.{riskLevel} {level.label}
          </div>
        </div>
      </div>

      {/* Sub-bar */}
      <div className="bg-accent-light/80 border-t border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-9">
          <span className="text-xs text-white/70">
            타코 모니터링 중..
          </span>
          <div className="flex items-center gap-1.5 text-xs text-white/50">
            <Clock className="w-3 h-3" />
            <span>최근 업데이트: {formatTime(updatedAt)}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
