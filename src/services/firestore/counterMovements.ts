import {
  collection, doc, getDocs, addDoc, deleteDoc,
  query, orderBy, where, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { CounterMovement } from '@/types/firestore'

const col = (uid: string) => collection(db, 'users', uid, 'counterMovements')

export async function getCounterMovements(uid: string): Promise<CounterMovement[]> {
  const q    = query(col(uid), orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as CounterMovement))
}

export async function getMovementsBySource(
  uid: string,
  sourceDocId: string,
): Promise<CounterMovement[]> {
  const q    = query(col(uid), where('sourceDocId', '==', sourceDocId))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as CounterMovement))
}

export async function addCounterMovement(
  uid: string,
  movement: Omit<CounterMovement, 'id' | 'createdAt'>,
): Promise<string> {
  const ref = await addDoc(col(uid), { ...movement, createdAt: serverTimestamp() })
  return ref.id
}

export async function deleteCounterMovement(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(col(uid), id))
}

// Supprime tous les mouvements liés à un document source
export async function deleteMovementsBySource(uid: string, sourceDocId: string): Promise<void> {
  const movements = await getMovementsBySource(uid, sourceDocId)
  await Promise.all(movements.map(m => deleteCounterMovement(uid, m.id)))
}
