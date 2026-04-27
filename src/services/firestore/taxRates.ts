import {
  collection, doc, getDocs, addDoc, deleteDoc,
  query, orderBy, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { TaxRate } from '@/types/firestore'

const col = (uid: string) => collection(db, 'users', uid, 'taxRates')

export async function getTaxRates(uid: string): Promise<TaxRate[]> {
  const q   = query(col(uid), orderBy('effectiveFrom', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as TaxRate))
}

export async function addTaxRate(
  uid: string,
  rate: Omit<TaxRate, 'id' | 'createdAt'>,
): Promise<string> {
  const ref = await addDoc(col(uid), { ...rate, createdAt: serverTimestamp() })
  return ref.id
}

export async function deleteTaxRate(uid: string, id: string): Promise<void> {
  await deleteDoc(doc(col(uid), id))
}

// Retourne le taux actif (le plus récent dont effectiveFrom <= monthKey)
export function getActiveTaxRate(rates: TaxRate[], monthKey: string): number | null {
  const applicable = rates
    .filter(r => r.effectiveFrom <= monthKey)
    .sort((a, b) => b.effectiveFrom.localeCompare(a.effectiveFrom))
  return applicable.length > 0 ? applicable[0].ratePercent / 100 : null
}
