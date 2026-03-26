import { useState, useEffect } from 'react';
import { Clock, Sun, Moon, Share2 } from 'lucide-react';
import { RISK_LEVELS } from '../utils/constants';

interface HeaderProps {
  riskLevel: number;
  updatedAt: string;
}

export default function Header({ riskLevel, updatedAt }: HeaderProps) {
  const level = RISK_LEVELS[riskLevel as keyof typeof RISK_LEVELS] || RISK_LEVELS[1];
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleShare = async () => {
    const shareData = {
      title: '타코알리미 – Trump Always Chickens Out',
      text: `현재 타코 지수: Lv.${riskLevel} ${level.label}`,
      url: 'https://tacotrump.space',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share failed
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

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

          <div className="flex items-center gap-2">
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
      </div>

      {/* Sub-bar */}
      <div className="bg-accent-light/80 border-t border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-9">
          <span className="text-xs text-white/70">
            타코 모니터링 중..
          </span>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-white/50">
              <Clock className="w-3 h-3" />
              <span>최근 업데이트: {formatTime(updatedAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white/90 transition-colors"
                aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
              </button>
              <div className="relative">
                <button
                  onClick={handleShare}
                  className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white/90 transition-colors"
                  aria-label="공유하기"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
                {copied && (
                  <div className="absolute right-0 top-full mt-1 px-2 py-1 bg-black/80 text-white text-[10px] rounded whitespace-nowrap z-50">
                    복사됨!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
