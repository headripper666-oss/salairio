// Notifications via Web Push — le serveur Render planifie et envoie les push.
// Le SW reçoit l'event push et affiche la notification, même app fermée.

import { useAuthStore } from '@/store/authStore'

const PUSH_SERVER = 'https://salairio-push.onrender.com'

let subscriptionCache: PushSubscription | null = null

function getUserId(): string | null {
  return useAuthStore.getState().user?.uid ?? null
}

async function getSubscription(): Promise<PushSubscription | null> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return null

  const userId = getUserId()
  if (!userId) return null

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
    }

    // Toujours envoyer au serveur pour enregistrer cet appareil sous le userId
    if (!subscriptionCache) {
      await fetch(`${PUSH_SERVER}/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...sub.toJSON() }),
      })
      subscriptionCache = sub
    }

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
  const userId = getUserId()
  if (!userId) return
  await getSubscription()

  await fetch(`${PUSH_SERVER}/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, userId, title, body, at: at.getTime() }),
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
