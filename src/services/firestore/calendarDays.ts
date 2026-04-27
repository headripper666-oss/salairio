import {
  collection, doc, getDoc, getDocs, setDoc,
  query, where, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { CalendarDay } from '@/types/firestore'

const col = (uid: string) => collection(db, 'users', uid, 'calendarDays')
const ref = (uid: string, date: string) => doc(col(uid), date)

export async function getCalendarDay(uid: string, date: string): Promise<CalendarDay | null> {
  const snap = await getDoc(ref(uid, date))
  return snap.exists() ? (snap.data() as CalendarDay) : null
}

export async function setCalendarDay(
  uid: string,
  date: string,
  data: Omit<CalendarDay, 'date' | 'updatedAt'>,
): Promise<void> {
  const docData = Object.fromEntries(
    Object.entries({ ...data, date, updatedAt: serverTimestamp() })
      .filter(([, v]) => v !== undefined),
  )
  await setDoc(ref(uid, date), docData, { merge: false })
}

export async function getMonthCalendarDays(
  uid: string,
  monthKey: string, // "2026-04"
): Promise<CalendarDay[]> {
  const q    = query(col(uid), where('date', '>=', `${monthKey}-01`), where('date', '<=', `${monthKey}-31`))
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data() as CalendarDay)
}
