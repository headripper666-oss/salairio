import {
  collection, getDocs, deleteDoc, doc,
  query, where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function deleteAllDocs(col: ReturnType<typeof collection>): Promise<void> {
  const snap = await getDocs(col)
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
}

async function deleteByMonthKey(uid: string, collectionName: string, monthKey: string): Promise<void> {
  const col = collection(db, 'users', uid, collectionName)
  const q = query(col, where('monthKey', '==', monthKey))
  const snap = await getDocs(q)
  await Promise.all(snap.docs.map(d => deleteDoc(d.ref)))
}

// ─── Nettoyage d'un mois ───────────────────────────────────────────────────────

export async function cleanMonth(uid: string, monthKey: string): Promise<void> {
  // Supprimer les jours calendrier du mois
  const calendarCol = collection(db, 'users', uid, 'calendarDays')
  const calQ = query(
    calendarCol,
    where('date', '>=', `${monthKey}-01`),
    where('date', '<=', `${monthKey}-31`),
  )
  const calSnap = await getDocs(calQ)
  await Promise.all(calSnap.docs.map(d => deleteDoc(d.ref)))

  // Supprimer les mouvements compteur du mois
  await deleteByMonthKey(uid, 'counterMovements', monthKey)

  // Supprimer les primes ponctuelles du mois
  await deleteByMonthKey(uid, 'oneOffBonuses', monthKey)

  // Supprimer la synthèse mensuelle si elle existe
  const summaryRef = doc(db, 'users', uid, 'monthlySummaries', monthKey)
  await deleteDoc(summaryRef).catch(() => {})
}

// ─── Nettoyage d'une année ─────────────────────────────────────────────────────

export async function cleanYear(uid: string, year: number): Promise<void> {
  const months = Array.from({ length: 12 }, (_, i) =>
    `${year}-${String(i + 1).padStart(2, '0')}`,
  )
  await Promise.all(months.map(mk => cleanMonth(uid, mk)))

  // Supprimer la synthèse annuelle si elle existe
  const yearRef = doc(db, 'users', uid, 'yearlySummaries', String(year))
  await deleteDoc(yearRef).catch(() => {})
}

// ─── Réinitialisation complète (données de pointage uniquement) ───────────────

export async function resetAccount(uid: string): Promise<void> {
  const collections = [
    'calendarDays',
    'counterMovements',
    'appointments',
    'monthlySummaries',
    'yearlySummaries',
    'oneOffBonuses',
  ]
  await Promise.all(
    collections.map(name =>
      deleteAllDocs(collection(db, 'users', uid, name)),
    ),
  )
}
