import { useState } from 'react';
import { Bell, X } from 'lucide-react';

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

export default function NotificationCTA() {
  const [dismissed, setDismissed] = useState(() =>
    localStorage.getItem('push_enabled') === 'true' ||
    localStorage.getItem('noti_cta_dismissed') === 'true'
  );
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(() =>
    localStorage.getItem('push_enabled') === 'true'
  );

  if (dismissed) return null;

  const pushSupported = 'serviceWorker' in navigator && 'PushManager' in window && !!VAPID_PUBLIC_KEY;

  const handleEnable = async () => {
    if (!pushSupported) return;
    if (loading) return;
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setLoading(false);
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
      setDone(true);
      setTimeout(() => setDismissed(true), 1500);
    } catch (err) {
      console.error('Push subscription failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('noti_cta_dismissed', 'true');
    setDismissed(true);
  };

  // 푸시 미지원 환경 안내 메시지
  const guideMessage = isIOS() && !isStandalone()
    ? '아이폰: Safari 하단 공유(⬆) → "홈 화면에 추가" → 앱에서 알림 켜기'
    : !pushSupported
      ? 'Chrome 브라우저에서 접속하면 알림을 받을 수 있어요.'
      : '';

  return (
    <div className="relative toss-card p-4 flex items-center gap-4">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 p-1 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-card-hover transition-colors"
        aria-label="닫기"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
        <Bell className="w-5 h-5 text-accent" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">
          {done ? '알림 설정 완료!' : '타코 레벨 변경 알림 받기'}
        </p>
        <p className="text-xs text-text-muted mt-0.5">
          {done
            ? '위험 레벨이 바뀌면 알려드릴게요.'
            : guideMessage || 'TACO 지수가 급변하면 즉시 알림을 보내드려요.'}
        </p>
      </div>

      {!done && pushSupported && (
        <button
          onClick={handleEnable}
          disabled={loading}
          className="shrink-0 px-4 py-2 bg-accent hover:bg-accent/90 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          {loading ? '...' : '켜기'}
        </button>
      )}
    </div>
  );
}
