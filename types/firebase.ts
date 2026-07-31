// Types Firestore — structure des documents

import type { RunState } from './index'

// Collections Firestore
export interface FirestoreRun extends RunState {
  __type: 'run'
}

// Noms des collections
export const COLLECTIONS = {
  runs: 'runs',
  scores: 'scores',
  scenes: 'scenes',
  characters: 'characters',
  clues: 'clues',
} as const

export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS]
