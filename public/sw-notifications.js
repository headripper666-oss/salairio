// Service Worker — reçoit les push du serveur Render et affiche la notification.

self.addEventListener('push', event => {
  if (!event.data) return
  const { title, body, tag } = event.data.json()
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag,
      renotify: true,
    })
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(list => {
      const client = list.find(c => c.url.includes(self.location.origin))
      if (client) client.focus()
      else clients.openWindow('/')
    })
  )
})
