import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { useI18n } from '../i18n';

interface ShareButtonProps {
  riskLevel: number;
}

export default function ShareButton({ riskLevel }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();

  const handleShare = async () => {
    const text = t(`share.viral${riskLevel}` as 'share.viral1');
    const shareData = {
      title: t('share.title'),
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
      <span className="text-sm">{t('share.button')}</span>
      {copied && (
        <span className="absolute right-4 text-xs text-white/80 font-medium">
          {t('share.copied')}
        </span>
      )}
    </button>
  );
}
