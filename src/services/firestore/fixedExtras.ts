import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { FixedExtra } from '@/types/firestore'

const col = (uid: string) => collection(db, 'users', uid, 'fixedExtras')

export async function getFixedExtras(uid: string): Promise<FixedExtra[]> {
  const q    = query(col(uid), orderBy('order', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as FixedExtra))
}

export async function addFixedExtra(
  uid: string,
  extra: Omit<FixedExtra, 'id' | 'createdAt'>,
): Promise<string> {
  const ref = await addDoc(col(uid), { ...extra, createdAt: serverTimestamp() })
  return ref.id
}

export async function updateFixedExtra(
  uid: string,
  id: string,
  updates: Partial<Omit<FixedExtra, 'id' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(col(uid), id), updates)
}

export async function deleteFixedExtra(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(col(uid), id))
}
