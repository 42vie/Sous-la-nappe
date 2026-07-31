// CRUD pour la collection 'scores'
import {
  collection,
  doc,
  setDoc,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from 'firebase/firestore'
import { db } from './client'
import { COLLECTIONS } from '@/types/firebase'
import type { FinalScore } from '@/types'

const scoresRef = () => collection(db, COLLECTIONS.scores)

/** Enregistrer un score final */
export async function saveScore(score: Omit<FinalScore, 'completedAt'>): Promise<string> {
  const docRef = doc(scoresRef())
  const fullScore: FinalScore = {
    ...score,
    completedAt: Date.now(),
  }
  await setDoc(docRef, fullScore)
  return docRef.id
}

/** Récupérer l'historique de scores d'un joueur */
export async function getPlayerScores(playerId: string, maxResults = 10): Promise<FinalScore[]> {
  const q = query(
    scoresRef(),
    where('playerId', '==', playerId),
    orderBy('completedAt', 'desc'),
    limit(maxResults)
  )
  const snaps = await getDocs(q)
  return snaps.docs.map(d => d.data() as FinalScore)
}
