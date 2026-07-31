// ============================================================
// TYPES/INDEX.TS — Re-export centralisé depuis lib/types
// Évite les doublons de définition et garantit qu'un seul RunState
// existe à la compilation.
// ============================================================

export type { CharacterId, CharacterState, HostIntent, TargetPlanned, PoisonVector, AccompliceType, MedicationState } from '@/lib/types/characters'
export type { SceneId, SceneChoice, MinigameId } from '@/lib/types/scenes'
export type { ClueId, DiscoveredClue } from '@/lib/types/clues'
export type { SeatingHistory, SeatingVariant, SeatingSnapshot } from '@/lib/types/house'
export type { EndingId } from '@/lib/types/endings'
export type {
  RunState,
  CanonLayer,
  VariableLayer,
  SubjectiveLayer,
  SceneHistoryEntry,
  NarrativeVersion,
  TransitionResult,
  FinalScreenData,
  FinalColumn,
  FinalAnswers,
} from '@/lib/types/engine'
