import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { YearlySummary } from '@/types/firestore'

const ref = (uid: string, year: number) =>
  doc(db, 'users', uid, 'yearlySummaries', String(year))

export async function getYearlySummary(
  uid: string,
  year: number,
): Promise<YearlySummary | null> {
  const snap = await getDoc(ref(uid, year))
  return snap.exists() ? (snap.data() as YearlySummary) : null
}

export async function upsertYearlySummary(
  uid: string,
  year: number,
  data: Omit<YearlySummary, 'updatedAt'>,
): Promise<void> {
  await setDoc(ref(uid, year), { ...data, updatedAt: serverTimestamp() })
}
