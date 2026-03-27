import { useState } from 'react';
import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  riskLevel: number;
  label: string;
}

const VIRAL_TEXT: Record<number, string> = {
  1: '🌮 트럼프가 타코할 확률은? 매우 낮음!\n지금은 자신감 충전 중… 폭풍 전의 고요일 수도?\n👉 실시간 타코 지수 확인하기',
  2: '🌮 트럼프가 타코할 확률은? 낮음\n슬슬 시장이 흔들리는 낌새…\n👉 실시간 타코 지수 확인하기',
  3: '🌮 트럼프가 타코할 확률은? 높음!\n꼬리 내릴 준비 중이래요 ㅋㅋ\n👉 실시간 타코 지수 확인하기',
  4: '🚨 트럼프가 타코할 확률은? 매우 높음!!\n시장 패닉 → 정책 번복 임박 🌮🌮🌮\n👉 실시간 타코 지수 확인하기',
};

export default function ShareButton({ riskLevel, label }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const text = VIRAL_TEXT[riskLevel] ?? VIRAL_TEXT[1];
    const shareData = {
      title: '타코알리미 – 트럼프 타코 확률은?',
      text,
      url: 'https://tacotrump.space',
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled
      }
    } else {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleShare}
      className="relative w-full flex items-center justify-center gap-2 px-4 py-3 bg-bg-card border border-border-card rounded-xl text-text-primary hover:bg-bg-card/80 transition-colors cursor-pointer"
    >
      <Share2 className="w-4 h-4" />
      <span className="text-sm font-medium">공유하러 가기</span>
      {copied && (
        <span className="absolute right-4 text-xs text-green-500 font-medium">
          링크 복사됨!
        </span>
      )}
    </button>
  );
}
