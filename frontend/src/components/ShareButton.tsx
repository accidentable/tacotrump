import { useState } from 'react';
import { Share2 } from 'lucide-react';

interface ShareButtonProps {
  riskLevel: number;
  label: string;
}

export default function ShareButton({ riskLevel, label }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: '타코알리미 – Trump Always Chickens Out',
      text: `현재 타코 지수: Lv.${riskLevel} ${label}`,
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
