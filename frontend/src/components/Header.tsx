import { useState, useEffect } from 'react';
import { Clock, Sun, Moon, Bell, BellOff } from 'lucide-react';
import { RISK_LEVELS } from '../utils/constants';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

interface HeaderProps {
  riskLevel: number;
  updatedAt: string;
}

export default function Header({ riskLevel, updatedAt }: HeaderProps) {
  const level = RISK_LEVELS[riskLevel as keyof typeof RISK_LEVELS] || RISK_LEVELS[1];
  const [isDark, setIsDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  const [pushEnabled, setPushEnabled] = useState(() =>
    localStorage.getItem('push_enabled') === 'true'
  );
  const [pushLoading, setPushLoading] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handlePushToggle = async () => {
    if (pushLoading) return;
    setPushLoading(true);

    try {
      if (pushEnabled) {
        // Unsubscribe
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
        // Subscribe
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

  const formatTime = (s: string) => {
    if (!s || s === 'N/A') return '--:--';
    if (s.includes('KST')) return s.replace(' KST', '').trim();
    try {
      const d = new Date(s);
      if (isNaN(d.getTime())) return s;
      return d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return s;
    }
  };

  const pushSupported = 'serviceWorker' in navigator && 'PushManager' in window && VAPID_PUBLIC_KEY;

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
              {pushSupported && (
                <button
                  onClick={handlePushToggle}
                  disabled={pushLoading}
                  className="p-1 rounded hover:bg-white/10 text-white/60 hover:text-white/90 transition-colors disabled:opacity-50"
                  aria-label={pushEnabled ? '알림 해제' : '알림 켜기'}
                >
                  {pushEnabled
                    ? <Bell className="w-3.5 h-3.5" />
                    : <BellOff className="w-3.5 h-3.5" />}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
