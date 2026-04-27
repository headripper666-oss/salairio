import {
  collection, doc, getDocs, addDoc, deleteDoc,
  query, where, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { OneOffBonus } from '@/types/firestore'

const col = (uid: string) => collection(db, 'users', uid, 'oneOffBonuses')

export async function getOneOffBonuses(uid: string, monthKey?: string): Promise<OneOffBonus[]> {
  const q = monthKey
    ? query(col(uid), where('monthKey', '==', monthKey))
    : query(col(uid), orderBy('monthKey', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as OneOffBonus))
}

export async function addOneOffBonus(
  uid: string,
  bonus: Omit<OneOffBonus, 'id' | 'createdAt'>,
): Promise<string> {
  const ref = await addDoc(col(uid), { ...bonus, createdAt: serverTimestamp() })
  return ref.id
}

export async function deleteOneOffBonus(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(col(uid), id))
}
