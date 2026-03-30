/* Service Worker for Push Notifications + Widget Caching */

const WIDGET_CACHE = 'taco-widget-v1';
const WIDGET_PRECACHE = ['/widget.html'];
const WIDGET_API = '/api/widget';

// ── Install: 프리캐시 ────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(WIDGET_CACHE).then((cache) => cache.addAll(WIDGET_PRECACHE))
  );
  self.skipWaiting();
});

// ── Activate: 오래된 캐시 정리 ───────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== WIDGET_CACHE).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: widget API는 network-first, fallback to cache ─
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // widget API: network-first
  if (url.pathname === WIDGET_API) {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(WIDGET_CACHE).then((cache) => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // widget.html: network-first
  if (url.pathname === '/widget' || url.pathname === '/widget.html') {
    event.respondWith(
      fetch(event.request)
        .then((res) => {
          const clone = res.clone();
          caches.open(WIDGET_CACHE).then((cache) => cache.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match('/widget.html'))
    );
    return;
  }
});

// ── Push Notification ────────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: '타코알리미', body: '레벨이 변경되었습니다!' };
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch {
    // use defaults
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/taco-192.png',
      badge: '/taco-192.png',
      data: { url: 'https://tacotrump.space' },
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || 'https://tacotrump.space';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});

// ── Periodic Sync: 위젯 데이터 백그라운드 갱신 ─────────
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'taco-widget-sync') {
    event.waitUntil(
      fetch(WIDGET_API)
        .then((res) => {
          const clone = res.clone();
          return caches.open(WIDGET_CACHE).then((cache) => cache.put(WIDGET_API, clone));
        })
        .catch(() => {/* ignore */})
    );
  }
});
