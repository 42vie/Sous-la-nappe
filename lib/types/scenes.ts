/**
 * Scenes — 11 scenes, each with choices and consequences.
 * Based strictly on chapter 8 of the PDF.
 */

import type { CharacterId } from './characters';
import type { ClueId } from './clues';
import type { SeatingStateKey } from './house';

export type SceneId =
  | 'scene_01_opening_memory'
  | 'scene_01b_conversation_palier'
  | 'scene_02_arrival'
  | 'scene_02b_telephone_yanis'
  | 'scene_03_first_exchanges'
  | 'scene_03b_confidence_sarah'
  | 'scene_04_seating'
  | 'scene_04b_echange_regards'
  | 'scene_05_social_game_1'
  | 'scene_05b_remarque_ines'
  | 'scene_06_kitchen_aside'
  | 'scene_06b_lucas_yanis_dehors'
  | 'scene_07_social_game_2'
  | 'scene_07b_demande_noe_lucas'
  | 'scene_08_critical_service'
  | 'scene_09_incident'
  | 'scene_09b_couloir_incident'
  | 'scene_10_aftermath'
  | 'scene_11_reconstruction';

export type ActionVerb =
  | 'observe'
  | 'speak'
  | 'follow'
  | 'stay_silent'
  | 'intervene'
  | 'change_seat'
  | 'help_service'
  | 'confront'
  | 'let_pass'
  | 'examine_object'
  | 'leave_room'
  | 'listen';

export interface SceneChoice {
  id: string;
  verb: ActionVerb;
  label: string;                // Short player-facing label
  description?: string;         // Optional longer description
  availableFor: CharacterId[] | 'all';
  requiresFlag?: string;        // Game flag required
  effects: ChoiceEffect[];
  revealsClue?: ClueId | ClueId[];
  nextScene?: SceneId;          // Override next scene
}

export interface ChoiceEffect {
  type: 'state_delta' | 'flag_set' | 'flag_clear' | 'seating_update' | 'narrative_note';
  key?: string;                 // state variable or flag name
  delta?: number;               // for state_delta
  value?: string | boolean;     // for flag_set or seating_update
  note?: string;                // for narrative_note
}

export interface SceneData {
  id: SceneId;
  index: number;                // 1–11
  title: string;
  durationMin: number;          // target minutes for this scene
  availablePovs: CharacterId[] | 'all';
  /** Which seating state is updated at end of this scene */
  updatesSeating?: SeatingStateKey;
  /** Mini-game module id if applicable */
  minigameId?: MinigameId;
  /** Narrative text blocks, keyed by POV */
  narrativeBlocks: Partial<Record<CharacterId, string>> & { default: string };
  /** Choices available in this scene (filtered by POV at runtime) */
  choices: SceneChoice[];
  /** Clues deposited in this scene regardless of choice */
  autoRevealClues?: ClueId[];
  /** System effects applied on scene entry */
  onEnterEffects?: ChoiceEffect[];
  /** Canonical facts this scene establishes */
  canonicalFacts: string[];
}

export type MinigameId =
  | 'tone_puzzle'          // MVP-1: scène 3
  | 'tictactoe_hidden'     // MVP-2: scène 5
  | 'dosage_order'         // MVP-3: scène 8
  | 'audio_reconstruction' // MVP-4: scènes 10-11
  | 'family_pairs'         // Reserve
  | 'judgment_duel'        // Reserve
  | 'kitchen_pressure'     // Reserve
  | 'toxic_memory';        // Reserve
