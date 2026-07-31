// CRUD pour la collection 'runs'
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore'
import { db } from './client'
import { COLLECTIONS } from '@/types/firebase'
import type { RunState } from '@/types'

const runsRef = () => collection(db, COLLECTIONS.runs)

/** Créer un nouveau run */
export async function createRun(run: Omit<RunState, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const docRef = doc(runsRef())
  await setDoc(docRef, {
    ...run,
    id: docRef.id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  })
  return docRef.id
}

/** Lire un run par ID */
export async function getRun(runId: string): Promise<RunState | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.runs, runId))
  if (!snap.exists()) return null
  return snap.data() as RunState
}

/** Mettre à jour un run (partial) */
export async function updateRun(
  runId: string,
  updates: Partial<RunState>
): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.runs, runId), {
    ...updates,
    updatedAt: Date.now(),
  })
}

/** Récupérer les runs d'un joueur */
export async function getPlayerRuns(playerId: string, maxResults = 5): Promise<RunState[]> {
  const q = query(
    runsRef(),
    where('playerId', '==', playerId),
    orderBy('createdAt', 'desc'),
    limit(maxResults)
  )
  const snaps = await getDocs(q)
  return snaps.docs.map(d => d.data() as RunState)
}
