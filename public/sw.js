self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIF') {
    const options = {
      body: event.data.body,
      icon: '/icon-72x72.png', // iconița ta
      badge: '/icon-72x72.png',
      vibrate: [100, 50, 100],
      data: { url: event.data.url }
    };
    self.registration.showNotification(event.data.title, options);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});
