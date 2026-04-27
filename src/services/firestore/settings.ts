import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { UserSettings } from '@/types/firestore'

const ref = (uid: string) => doc(db, 'users', uid, 'settings', 'main')

export async function getSettings(uid: string): Promise<UserSettings | null> {
  const snap = await getDoc(ref(uid))
  return snap.exists() ? (snap.data() as UserSettings) : null
}

export async function setSettings(
  uid: string,
  updates: Partial<Omit<UserSettings, 'updatedAt'>>,
): Promise<void> {
  await setDoc(ref(uid), { ...updates, updatedAt: serverTimestamp() }, { merge: true })
}
