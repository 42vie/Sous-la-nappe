// Types Firestore — structure des documents

import type { RunState, FinalScore, Scene, Character, Clue } from './index'

// Collections Firestore
export interface FirestoreRun extends RunState {
  __type: 'run'
}

export interface FirestoreScore extends FinalScore {
  __type: 'score'
}

export interface FirestoreScene extends Scene {
  __type: 'scene'
}

export interface FirestoreCharacter extends Character {
  __type: 'character'
}

export interface FirestoreClue extends Clue {
  __type: 'clue'
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
