import {
  collection, doc, getDocs, addDoc, deleteDoc,
  query, where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { HolidayOverride } from '@/types/firestore'

const col = (uid: string) => collection(db, 'users', uid, 'holidayOverrides')

export async function getHolidayOverrides(uid: string, year: number): Promise<HolidayOverride[]> {
  const q    = query(col(uid), where('year', '==', year))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as HolidayOverride))
}

export async function addHolidayOverride(
  uid: string,
  override: Omit<HolidayOverride, 'id'>,
): Promise<string> {
  const ref = await addDoc(col(uid), override)
  return ref.id
}

export async function deleteHolidayOverride(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(col(uid), id))
}
