/**
 * Engine types — run state, flags, transitions
 */

import type { CharacterId, CharacterState, HostIntent, TargetPlanned, PoisonVector, AccompliceType, MedicationState } from './characters';
import type { SceneId, SceneChoice, MinigameId } from './scenes';
import type { ClueId, DiscoveredClue } from './clues';
import type { SeatingHistory, SeatingVariant, SeatingSnapshot } from './house';
import type { EndingId } from './endings';
import type { MutualTrustMatrix } from '@/lib/engine/mutualTrust';

/** The complete run state — source of truth for one game session */
export interface RunState {
  runId: string;
  createdAt: number;  // timestamp
  playerPov: CharacterId;

  /** Un personnage par chapitre joué jusqu'ici, dans l'ordre (chapitre N = povHistory[N-1]) */
  povHistory: CharacterId[];

  // === CANONICAL LAYER (never changes) ===
  canon: CanonLayer;

  // === VARIABLE LAYER (changes per run) ===
  variable: VariableLayer;

  // === SUBJECTIVE LAYER (changes per POV) ===
  subjective: SubjectiveLayer;

  // === PROGRESSION ===
  currentScene: SceneId;
  visitedScenes: SceneId[];
  completedScenes: SceneId[];
  sceneHistory: SceneHistoryEntry[];

  // === FLAGS ===
  flags: Record<string, boolean | string | number>;

  // === CLUES ===
  discoveredClues: DiscoveredClue[];

  // === FINAL STATE ===
  ending?: EndingId;
  isComplete: boolean;
}

/** The nine canonical truths — constant across all runs */
export interface CanonLayer {
  maelysOrganizedWithFalsePretext: true;
  intentExistedBeforeFirstGuest: true;
  vectorPreparedInAdvance: true;
  plannedTargetIsNotSarah: true;
  maelysLostControlAtService: true;
  witnessStayedSilentWithinHour: true;
  sarahAffectedInAllBranches: true;
  collectiveNarrativeBuilt: true;
  noPovHasCompleteView: true;
}

/** Variable layer — changes per run */
export interface VariableLayer {
  hostIntent: HostIntent;
  targetPlanned: TargetPlanned;
  targetActual: CharacterId[];
  poisonVector: PoisonVector;
  serviceHelper: CharacterId;
  witnessOfCriticalMove: CharacterId | null;
  accompliceType: AccompliceType;
  seatingVariant: SeatingVariant;
  seatingHistory: SeatingHistory;
  deaths: CharacterId[];
  survivors: CharacterId[];
  survivingNarrative: NarrativeVersion;
  characterState: CharacterState;
  socialTension: number;   // 0–100
  memoryDistortion: number; // 0–100, affects audio reconstruction minigame
  /** Confiance mutuelle vivante — évolue en jeu selon les actions, contrairement à RELATIONSHIP_MATRIX (passif figé). Optionnel : absent sur les runs créés avant son introduction. */
  mutualTrust?: MutualTrustMatrix;
}

export type NarrativeVersion =
  | 'truth_complete'       // Full truth known
  | 'truth_partial'        // Partial — witness spoke but incomplete
  | 'false_sarah_self_harm' // Dominant false narrative (31% probability)
  | 'accident_food'        // Food mishap narrative
  | 'collective_silence';  // Nobody says anything coherent

/** Subjective layer — what this POV believes */
export interface SubjectiveLayer {
  believedTargetPlanned: CharacterId | null;
  believedTargetActual: CharacterId | null;
  believedNarrative: NarrativeVersion;
  ownRoleBelieved: string;
  openingMemoryError: string; // the planted error in scene 1
}

export interface SceneHistoryEntry {
  sceneId: SceneId;
  choicesMade: string[];  // choice ids
  cluesFound: ClueId[];
  timestamp: number;
  narrativeNotes: string[];
}

/** Engine transition result */
export interface TransitionResult {
  nextScene: SceneId | null;
  stateUpdates: Partial<RunState>;
  flagUpdates: Record<string, boolean | string | number>;
  cluesRevealed: ClueId[];
  narrativeInjections: string[]; // text lines to append
  minigameToLaunch?: MinigameId;
}

/** Final screen data — three columns */
export interface FinalScreenData {
  planned: FinalColumn;
  actual: FinalColumn;
  narrated: FinalColumn;
  answers: FinalAnswers;
  qualitativeLines: string[];
  lastLine: string; // the canonical last line
  score: number;    // 0–100, not shown directly
}

export interface FinalColumn {
  targetWho: string;
  targetWhy: string;
  mechanism: string;
  whoKnew: string;
  whatsaid: string;
}

export interface FinalAnswers {
  q1_realRole: string;
  q2_targetPlanned: string;
  q3_targetActual: string;
  q4_seatingAtService: string;
  q5_whoCarriedPlates: string;
  q6_whoSawAndSaidNothing: string;
  q7_decisiveGap: string;
  q8_narrativeOut: string;
}
