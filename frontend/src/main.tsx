import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Register Service Worker for Push Notifications + Widget Caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');

      // Periodic Background Sync (위젯 데이터 갱신, 지원 브라우저만)
      if ('periodicSync' in reg) {
        const status = await navigator.permissions.query({
          name: 'periodic-background-sync' as PermissionName,
        });
        if (status.state === 'granted') {
          await (reg as unknown as { periodicSync: { register: (tag: string, opts: { minInterval: number }) => Promise<void> } }).periodicSync.register('taco-widget-sync', {
            minInterval: 15 * 60 * 1000, // 15분
          });
        }
      }
    } catch (err) {
      console.warn('SW registration failed:', err);
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
