import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { HourlyRatePeriod } from '@/types/firestore'

const col = (uid: string) => collection(db, 'users', uid, 'hourlyRatePeriods')

export async function getHourlyRatePeriods(uid: string): Promise<HourlyRatePeriod[]> {
  const q = query(col(uid), orderBy('startDate', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as HourlyRatePeriod))
}

export async function addHourlyRatePeriod(
  uid: string,
  period: Omit<HourlyRatePeriod, 'id' | 'createdAt'>,
): Promise<string> {
  const ref = await addDoc(col(uid), { ...period, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateHourlyRatePeriod(
  uid: string,
  id: string,
  updates: Partial<Omit<HourlyRatePeriod, 'id' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(col(uid), id), updates)
}

export async function deleteHourlyRatePeriod(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(col(uid), id))
}
