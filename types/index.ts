// ============================================================
// TYPES PRINCIPAUX — Sous la nappe
// ============================================================

// --- Personnages -------------------------------------------

export type CharacterId =
  | 'maelys'
  | 'noe'
  | 'ines'
  | 'lucas'
  | 'sarah'
  | 'yanis'

export interface Character {
  id: CharacterId
  name: string
  age: number
  role: string
  tagline: string
  initialVars: Record<string, number | string | boolean>
  blindSpots: string[]
  voiceSignature: string
}

// --- État d'un run ----------------------------------------

export type HostIntent = 'humiliate' | 'sicken' | 'kill_one'
export type PoisonVector = 'sauce' | 'cocktail' | 'dessert' | 'beurre'
export type SeatingVariant = 'base' | 'swapA' | 'swapB' | 'chaos'
export type AccompliceType = 'none' | 'moral' | 'passive' | 'active'
export type NoePresence = 'present' | 'late' | 'absent'
export type SarahMedication = 'taken' | 'forgotten' | 'mixed_badly'

export interface RunState {
  id: string
  playerId: string
  playerCharacter: CharacterId
  createdAt: number
  updatedAt: number

  // Couche 1 — plan
  hostIntent: HostIntent
  targetPlanned: CharacterId
  poisonVector: PoisonVector

  // Couche 2 — déformation sociale
  socialTension: number       // 0–100
  maelysColere: number
  maelysControle: number
  maelysIntoxication: number
  maelysPanic: number

  // Couche 3 — géographie
  seatingVariant: SeatingVariant
  seatingPlanned: Record<number, CharacterId>   // siège 1–6 → perso
  seatingBeforeMain: Record<number, CharacterId>
  seatingAtCritical: Record<number, CharacterId>
  seatingAfterIncident: Record<number, CharacterId>

  // Couche 4 — résolution
  serviceHelper: CharacterId
  witnessOfCriticalMove: CharacterId | null
  targetActual: CharacterId[]

  // Couche 5 — fabrication
  accompliceType: AccompliceType
  survivingNarrative: string
  deaths: CharacterId[]
  survivors: CharacterId[]

  // Flags narratifs
  flags: Record<string, boolean | number | string>

  // État de progression
  currentScene: number        // 1–11
  discoveredClues: string[]   // références C-01–C-26
  sceneChoices: Record<string, string>  // clé = scène+choix, valeur = option choisie

  // Paramètres
  noePresence: NoePresence
  sarahMedication: SarahMedication
}

// --- Scènes ------------------------------------------------

export interface Choice {
  id: string
  label: string
  condition?: string          // expression évaluée contre RunState
  effects: Partial<RunState>
  flagsSet?: Record<string, boolean | number | string>
  unlocksClue?: string
}

export interface Scene {
  id: number
  title: string
  duration: number            // minutes cibles
  availablePovs: CharacterId[]
  description: string
  choices: Choice[]
  cluesDeposited: string[]    // références C-xx
  miniGame?: MiniGameType
}

export type MiniGameType =
  | 'tone_puzzle'       // MVP-1
  | 'tictactoe'         // MVP-2
  | 'plating_order'     // MVP-3
  | 'audio_reconstruction' // MVP-4

// --- Indices -----------------------------------------------

export type ClueReliability = 'faible' | 'moyenne' | 'haute' | 'tres_haute'

export interface Clue {
  ref: string               // C-01, C-02...
  label: string
  where: string
  access: CharacterId[] | 'all'
  reliability: ClueReliability
  proves: string
  misleads: string
}

// --- Fins --------------------------------------------------

export type EndingId =
  | 'F1' | 'F2' | 'F3' | 'F4' | 'F5'
  | 'D1' | 'D2'
  | 'S1'

export interface Ending {
  id: EndingId
  title: string
  conditions: Partial<RunState>   // clés/valeurs à matcher
  description: string
  playerMessage: string
}

// --- Écran final -------------------------------------------

export interface FinalAnswer {
  question: number  // 1–8
  answer: string
}

export interface FinalScore {
  runId: string
  playerId: string
  completedAt: number
  answers: FinalAnswer[]
  totalScore: number          // sur 100
  endingId: EndingId
  qualitativeMessages: string[]
  survivingNarrative: string
  lastLine: string
}

// --- Relations entre personnages ---------------------------

export type RelationMatrix = Record<CharacterId, Record<CharacterId, number>>
