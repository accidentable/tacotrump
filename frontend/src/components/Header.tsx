import { useState, useEffect } from 'react';
import { Sun, Moon, Bell, BellOff, Globe } from 'lucide-react';
import { RISK_LEVELS } from '../utils/constants';
import { useI18n } from '../i18n';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

function isIOS() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone);
}

interface HeaderProps {
  riskLevel: number;
}

export default function Header({ riskLevel }: HeaderProps) {
  const { t, locale, setLocale } = useI18n();
  const level = RISK_LEVELS[riskLevel as keyof typeof RISK_LEVELS] || RISK_LEVELS[1];
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  const [pushEnabled, setPushEnabled] = useState(() =>
    localStorage.getItem('push_enabled') === 'true'
  );
  const [pushLoading, setPushLoading] = useState(false);
  const [showPushGuide, setShowPushGuide] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const pushFullySupported = 'serviceWorker' in navigator && 'PushManager' in window && !!VAPID_PUBLIC_KEY;

  const handlePushToggle = async () => {
    if (!pushFullySupported) {
      setShowPushGuide(true);
      return;
    }

    if (pushLoading) return;
    setPushLoading(true);

    try {
      if (pushEnabled) {
        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.getSubscription();
        if (sub) {
          await fetch('/api/push-subscribe', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sub.toJSON()),
          });
          await sub.unsubscribe();
        }
        localStorage.removeItem('push_enabled');
        setPushEnabled(false);
      } else {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          setPushLoading(false);
          return;
        }

        const reg = await navigator.serviceWorker.ready;
        const sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });

        await fetch('/api/push-subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sub.toJSON()),
        });

        localStorage.setItem('push_enabled', 'true');
        setPushEnabled(true);
      }
    } catch (err) {
      console.error('Push toggle failed:', err);
    } finally {
      setPushLoading(false);
    }
  };

  const guideMessage = isIOS() && !isStandalone()
    ? t('header.pushGuideIOS')
    : t('header.pushGuideDefault');

  const riskLabel = t(`risk.level${riskLevel}.label` as 'risk.level1.label');

  return (
    <>
      <header className="bg-bg-header border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold tracking-tight text-text-primary">
                TACO
              </h1>
              <span className="text-text-muted text-xs hidden sm:inline">|</span>
              <span className="text-text-muted text-sm hidden sm:inline">
                Trump Always Chickens Out
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div
                className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                style={{
                  backgroundColor: level.bg,
                  color: level.color,
                }}
              >
                Lv.{riskLevel} {riskLabel}
              </div>
              <button
                onClick={() => setLocale(locale === 'ko' ? 'en' : 'ko')}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card-hover transition-colors"
                aria-label={t('header.langToggle')}
              >
                <Globe className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsDark(!isDark)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card-hover transition-colors"
                aria-label={isDark ? t('header.lightMode') : t('header.darkMode')}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={handlePushToggle}
                disabled={pushLoading}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card-hover transition-colors disabled:opacity-50"
                aria-label={pushEnabled ? t('header.pushOff') : t('header.pushOn')}
              >
                {pushEnabled
                  ? <Bell className="w-4 h-4" />
                  : <BellOff className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {showPushGuide && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowPushGuide(false)} />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-72 toss-card p-5 text-center">
            <Bell className="w-8 h-8 text-accent mx-auto mb-3" />
            <p className="text-sm text-text-primary font-medium whitespace-pre-line leading-relaxed">
              {guideMessage}
            </p>
            <button
              onClick={() => setShowPushGuide(false)}
              className="mt-4 w-full py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-xl transition-colors"
            >
              {t('header.confirm')}
            </button>
          </div>
        </>
      )}
    </>
  );
}
