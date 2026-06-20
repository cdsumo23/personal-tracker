// worker/index.ts

// Add listeners for Web Push events
self.addEventListener('push', (event: any) => {
  let data = { title: 'Smart Planner', body: 'You have a new update.', url: '/notifications' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Smart Planner', body: event.data.text(), url: '/notifications' };
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/notifications'
    }
  };

  event.waitUntil(
    (self as any).registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event: any) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/notifications';

  event.waitUntil(
    (self as any).clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients: any[]) => {
      // Check if there is already a window open with this app and focus it
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if ('focus' in client) {
          return client.focus();
        }
      }
      // If not, open a new window
      if ((self as any).clients.openWindow) {
        return (self as any).clients.openWindow(urlToOpen);
      }
    })
  );
});
