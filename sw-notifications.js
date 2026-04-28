// Service Worker minimaliste pour les rappels push planifiés
// Stocke les notifications dans un tableau en mémoire (survit tant que le SW tourne)
// Sur Android Chrome, le SW reste actif en tâche de fond.

const scheduled = new Map() // id → timeoutId

self.addEventListener('message', event => {
  const { type, payload } = event.data ?? {}

  if (type === 'SCHEDULE') {
    const { id, title, body, at } = payload
    const delay = at - Date.now()
    if (delay <= 0) return

    if (scheduled.has(id)) clearTimeout(scheduled.get(id))

    const tid = setTimeout(() => {
      scheduled.delete(id)
      self.registration.showNotification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: id,
        renotify: false,
      })
    }, delay)

    scheduled.set(id, tid)
  }

  if (type === 'CANCEL') {
    const { id } = payload
    if (scheduled.has(id)) {
      clearTimeout(scheduled.get(id))
      scheduled.delete(id)
    }
  }

  if (type === 'CANCEL_PREFIX') {
    const { prefix } = payload
    for (const [id, tid] of scheduled.entries()) {
      if (id.startsWith(prefix)) {
        clearTimeout(tid)
        scheduled.delete(id)
      }
    }
  }
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
