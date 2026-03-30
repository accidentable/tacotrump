import { useState } from 'react';
import { Smartphone, X, Copy, Check, ExternalLink } from 'lucide-react';

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

export default function WidgetGuide() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ios = isIOS();

  const scriptUrl = 'https://tacotrump.space/scripts/taco-widget.js';

  const handleCopy = async () => {
    await navigator.clipboard.writeText(scriptUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-bg-card hover:bg-bg-card-hover border border-border rounded-2xl text-text-primary font-medium transition-colors cursor-pointer"
      >
        <Smartphone className="w-4 h-4" />
        <span className="text-sm">홈 화면 위젯 설정</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setOpen(false)} />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md toss-card p-6 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-text-primary">홈 화면 위젯 설정</h2>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card-hover transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {ios ? (
              /* iOS Guide */
              <div className="space-y-4">
                <p className="text-sm text-text-secondary leading-relaxed">
                  iOS에서는 <strong>Scriptable</strong> 앱을 사용하여 홈 화면 위젯을 추가할 수 있습니다.
                </p>

                <div className="space-y-3">
                  <Step n={1}>
                    App Store에서{' '}
                    <a
                      href="https://apps.apple.com/app/scriptable/id1405459188"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent font-medium inline-flex items-center gap-0.5"
                    >
                      Scriptable <ExternalLink className="w-3 h-3" />
                    </a>{' '}
                    앱을 설치합니다.
                  </Step>

                  <Step n={2}>
                    <span>아래 스크립트 URL을 복사합니다.</span>
                    <button
                      onClick={handleCopy}
                      className="mt-2 w-full flex items-center justify-between gap-2 px-3 py-2 bg-bg-primary rounded-lg text-xs font-mono text-text-secondary border border-border"
                    >
                      <span className="truncate">{scriptUrl}</span>
                      {copied ? (
                        <Check className="w-4 h-4 text-safe shrink-0" />
                      ) : (
                        <Copy className="w-4 h-4 shrink-0" />
                      )}
                    </button>
                  </Step>

                  <Step n={3}>
                    Scriptable 앱을 열고 새 스크립트를 만든 뒤, URL의 코드를 붙여넣습니다.
                  </Step>

                  <Step n={4}>
                    홈 화면을 길게 눌러 위젯 추가 → Scriptable → 생성한 스크립트를 선택합니다.
                  </Step>
                </div>

                <div className="mt-4 p-3 bg-bg-primary rounded-xl">
                  <p className="text-xs text-text-muted leading-relaxed">
                    또는 Safari에서 홈 화면에 추가하면 PWA로 바로 접근할 수 있습니다.
                  </p>
                </div>
              </div>
            ) : (
              /* Android Guide */
              <div className="space-y-4">
                <p className="text-sm text-text-secondary leading-relaxed">
                  Android에서는 Chrome 브라우저로 간편하게 홈 화면에 추가할 수 있습니다.
                </p>

                <div className="space-y-3">
                  <Step n={1}>
                    Chrome에서{' '}
                    <strong className="text-accent">tacotrump.space</strong>에 접속합니다.
                  </Step>

                  <Step n={2}>
                    Chrome 메뉴 (⋮) → <strong>"홈 화면에 추가"</strong>를 탭합니다.
                  </Step>

                  <Step n={3}>
                    "추가"를 눌러 홈 화면에 앱 아이콘을 생성합니다.
                  </Step>

                  <Step n={4}>
                    홈 화면의 TACO 아이콘을 탭하면 풀스크린 앱처럼 실행됩니다.
                  </Step>
                </div>

                <div className="mt-4 p-3 bg-bg-primary rounded-xl">
                  <p className="text-xs text-text-muted leading-relaxed">
                    Samsung Internet, Edge 등에서도 "홈 화면에 추가" 기능을 지원합니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
        {n}
      </div>
      <div className="text-sm text-text-secondary leading-relaxed">{children}</div>
    </div>
  );
}
