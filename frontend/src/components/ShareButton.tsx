import { useState } from 'react';
import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  riskLevel: number;
}

const VIRAL_TEXT: Record<number, string> = {
  1: '🌮 트럼프가 타코할 확률은? 매우 낮음!\n이란 전쟁 강경 모드 유지 중… 폭풍 전의 고요?\n👉 실시간 타코 지수 확인하기',
  2: '🌮 트럼프가 타코할 확률은? 낮음\n시장이 흔들리기 시작했어요…\n👉 실시간 타코 지수 확인하기',
  3: '🌮 트럼프가 타코할 확률은? 높음!\n협상 테이블로 돌아올 준비 중 ㅋㅋ\n👉 실시간 타코 지수 확인하기',
  4: '🚨 트럼프가 타코할 확률은? 매우 높음!!\n시장 패닉 → 전쟁 강경 노선 후퇴 임박 🌮🌮🌮\n👉 실시간 타코 지수 확인하기',
};

export default function ShareButton({ riskLevel }: ShareButtonProps) {
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
      className="relative w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-accent hover:bg-accent/90 rounded-2xl text-white font-medium transition-colors cursor-pointer"
    >
      <Share2 className="w-4 h-4" />
      <span className="text-sm">공유하러 가기</span>
      {copied && (
        <span className="absolute right-4 text-xs text-white/80 font-medium">
          링크 복사됨!
        </span>
      )}
    </button>
  );
}
