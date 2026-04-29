import {
  collection, doc, getDocs, setDoc, deleteDoc, serverTimestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { Appointment } from '@/types/firestore'

const col = (uid: string) => collection(db, 'users', uid, 'appointments')
const ref = (uid: string, id: string) => doc(col(uid), id)

export async function getAllAppointments(uid: string): Promise<Appointment[]> {
  const snap = await getDocs(col(uid))
  return snap.docs.map(d => d.data() as Appointment)
}

export async function setAppointment(uid: string, appt: Omit<Appointment, 'createdAt'>): Promise<void> {
  const docData = Object.fromEntries(
    Object.entries({ ...appt, createdAt: serverTimestamp() })
      .filter(([, v]) => v !== undefined),
  )
  await setDoc(ref(uid, appt.id), docData)
}

export async function deleteAppointment(uid: string, id: string): Promise<void> {
  await deleteDoc(ref(uid, id))
}
