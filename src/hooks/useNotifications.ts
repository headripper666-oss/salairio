// Notifications via Web Push — le serveur Render planifie et envoie les push.
// Le SW reçoit l'event push et affiche la notification, même app fermée.

const PUSH_SERVER = 'https://salairio-push.onrender.com'

let subscriptionCache: PushSubscription | null = null

async function getSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null

  if (subscriptionCache) return subscriptionCache

  try {
    const reg = await navigator.serviceWorker.ready
    const vapidRes = await fetch(`${PUSH_SERVER}/vapid-public-key`)
    const { key } = await vapidRes.json()

    let sub = await reg.pushManager.getSubscription()
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(key),
      })
      await fetch(`${PUSH_SERVER}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub),
      })
    }

    subscriptionCache = sub
    return sub
  } catch {
    return null
  }
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return new Uint8Array([...raw].map(c => c.charCodeAt(0))).buffer as ArrayBuffer
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  if (result !== 'granted') return false
  // Abonnement push immédiat après accord
  await getSubscription()
  return true
}

export function isNotificationGranted(): boolean {
  return 'Notification' in window && Notification.permission === 'granted'
}

export async function scheduleNotification(id: string, title: string, body: string, at: Date) {
  if (!isNotificationGranted()) return
  const sub = await getSubscription()
  if (!sub) return

  await fetch(`${PUSH_SERVER}/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, endpoint: sub.endpoint, title, body, at: at.getTime() }),
  }).catch(() => {})
}

export async function cancelNotification(id: string) {
  await fetch(`${PUSH_SERVER}/schedule/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  }).catch(() => {})
}

export async function cancelNotificationsWithPrefix(prefix: string) {
  await fetch(`${PUSH_SERVER}/schedule-prefix/${encodeURIComponent(prefix)}`, {
    method: 'DELETE',
  }).catch(() => {})
}

export function getScheduledIds(): string[] {
  return []
}
