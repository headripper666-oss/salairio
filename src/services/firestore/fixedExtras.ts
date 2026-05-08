import {
  collection, doc, getDocs, addDoc, updateDoc, deleteDoc,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { FixedExtra, FixedExtraPeriod } from '@/types/firestore'

const col = (uid: string) => collection(db, 'users', uid, 'fixedExtras')

// Migration à la volée : ancien format (amount + appliesFromMonth) → nouveau format (periods[])
function migrate(raw: Record<string, unknown> & { id: string }): FixedExtra {
  if (!raw.periods) {
    const period: FixedExtraPeriod = {
      amount: (raw.amount as number) ?? 0,
      appliesFromMonth: (raw.appliesFromMonth as string) ?? '2000-01',
    }
    return { ...raw, periods: [period] } as unknown as FixedExtra
  }
  return raw as unknown as FixedExtra
}

export async function getFixedExtras(uid: string): Promise<FixedExtra[]> {
  const q = query(col(uid), orderBy('order', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => migrate({ id: d.id, ...d.data() } as Record<string, unknown> & { id: string }))
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

export async function addPeriodToFixedExtra(
  uid: string,
  id: string,
  period: FixedExtraPeriod,
  currentPeriods: FixedExtraPeriod[],
): Promise<void> {
  const periods = [...currentPeriods.filter(p => p.appliesFromMonth !== period.appliesFromMonth), period]
    .sort((a, b) => a.appliesFromMonth.localeCompare(b.appliesFromMonth))
  await updateDoc(doc(col(uid), id), { periods })
}

export async function deletePeriodFromFixedExtra(
  uid: string,
  id: string,
  appliesFromMonth: string,
  currentPeriods: FixedExtraPeriod[],
): Promise<void> {
  const periods = currentPeriods.filter(p => p.appliesFromMonth !== appliesFromMonth)
  await updateDoc(doc(col(uid), id), { periods })
}

export async function deleteFixedExtra(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(col(uid), id))
}
