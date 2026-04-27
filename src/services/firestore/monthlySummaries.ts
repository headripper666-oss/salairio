import { doc, getDoc, setDoc, serverTimestamp, collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { MonthlySummary } from '@/types/firestore'

const ref = (uid: string, monthKey: string) =>
  doc(db, 'users', uid, 'monthlySummaries', monthKey)

export async function getMonthlySummary(
  uid: string,
  monthKey: string,
): Promise<MonthlySummary | null> {
  const snap = await getDoc(ref(uid, monthKey))
  return snap.exists() ? (snap.data() as MonthlySummary) : null
}

export async function getMonthlySummariesForYear(
  uid: string,
  year: number,
): Promise<Map<string, MonthlySummary>> {
  const colRef = collection(db, 'users', uid, 'monthlySummaries')
  const snap = await getDocs(colRef)
  const result = new Map<string, MonthlySummary>()
  snap.docs.forEach(d => {
    const data = d.data() as MonthlySummary
    if (data.monthKey?.startsWith(`${year}-`)) result.set(data.monthKey, data)
  })
  return result
}

export async function upsertMonthlySummary(
  uid: string,
  monthKey: string,
  data: Omit<MonthlySummary, 'updatedAt'>,
): Promise<void> {
  await setDoc(ref(uid, monthKey), { ...data, updatedAt: serverTimestamp() })
}
