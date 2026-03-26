/* Service Worker for Push Notifications */

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
