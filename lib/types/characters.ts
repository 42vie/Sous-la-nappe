/**
 * Characters — six playable POVs, strictly derived from the canonical PDF.
 * No extra characters. No invented data.
 */

export type CharacterId =
  | 'maelys'
  | 'noe'
  | 'ines'
  | 'lucas'
  | 'sarah'
  | 'yanis';

export type HostIntent = 'humiliate' | 'sicken' | 'kill_one';
export type TargetPlanned = 'noe' | 'ines';
export type PoisonVector = 'sauce' | 'cocktail' | 'dessert' | 'beurre';
export type AccompliceType = 'none' | 'moral' | 'passive' | 'active';
export type MedicationState = 'taken' | 'forgotten' | 'mixed_badly';
export type NoePresence = 'present' | 'late' | 'absent';

/** Internal state variables — NEVER exposed directly to the player UI */
export interface CharacterState {
  // Maëlys
  maelysColere: number;        // 0–100
  maelysControle: number;      // 0–100
  maelysPanic: number;         // 0–100
  maelysIntoxication: number;  // 0–100
  maelysIntention: HostIntent;

  // Noé
  noePresence: NoePresence;
  noeMensonge: number;
  noeLachete: number;
  noeCruaute: number;
  noeInfluenceMaelys: number;

  // Inès
  inesArrogance: number;
  inesIrritabilite: number;
  inesTensionSociale: number;

  // Lucas
  lucasLucidite: number;
  lucasCourage: number;
  lucasNeutralite: number;
  lucasProtectionNoe: number;

  // Sarah
  sarahMedication: MedicationState;
  sarahStabilite: number;
  sarahMemoire: number;
  sarahDependanceMaelys: number;

  // Yanis
  yanisJeuSocial: number;
  yanisAlcoolCollectif: number;
  yanisInsouciance: number;
  yanisDuoShift: boolean;
  yanisDoute: number;         // 0–100, doute grandissant sur son invitation (expansion v3)

  // Variables d'expansion (docs/expansion-v3-histoires-interactions.md,
  // histoires de fond 1-4) — alimentées par les scènes inter-chapitres S01b-S09b
  lucasRancuneNoe: number;      // 0–100
  maelysAmbivalence: number;    // 0–100
  inesAttachementNoe: number;   // 0–100
  inesCompliciteMorale: number; // 0–100
}

export const INITIAL_CHARACTER_STATE: CharacterState = {
  maelysColere: 55,
  maelysControle: 72,
  maelysPanic: 8,
  maelysIntoxication: 0,
  maelysIntention: 'sicken',

  noePresence: 'late',
  noeMensonge: 60,
  noeLachete: 70,
  noeCruaute: 20,
  noeInfluenceMaelys: 80,

  inesArrogance: 62,
  inesIrritabilite: 40,
  inesTensionSociale: 30,

  lucasLucidite: 70,
  lucasCourage: 32,
  lucasNeutralite: 78,
  lucasProtectionNoe: 55,

  sarahMedication: 'forgotten',
  sarahStabilite: 58,
  sarahMemoire: 50,
  sarahDependanceMaelys: 80,

  yanisJeuSocial: 65,
  yanisAlcoolCollectif: 40,
  yanisInsouciance: 70,
  yanisDuoShift: false,
  yanisDoute: 0,

  lucasRancuneNoe: 55,
  maelysAmbivalence: 45,
  inesAttachementNoe: 85,
  inesCompliciteMorale: 0,
};

/** Static character data (identity, voice, blind spots) */
export interface CharacterData {
  id: CharacterId;
  name: string;
  age: number;
  role: string;
  tagline: string;
  identity: string;
  wound: string;
  wantsTonight: string;
  blindSpots: string[];
  voiceSignature: string;
  voiceTics: string[];
  exampleLines: string[];
  /** POV-specific: what the player experiences when playing this character */
  povExperience: string;
  /** Tags for the engine */
  tags: CharacterTag[];
}

export type CharacterTag =
  | 'PIVOT'
  | 'POV_MOST_INFORMED'
  | 'POV_MOST_BLIND'
  | 'TARGET_PLANNED_1'
  | 'TARGET_PLANNED_2'
  | 'ARCHITECT_FALSE_NARRATIVE'
  | 'CANONICAL_WITNESS'
  | 'HOLDS_VOICEMAIL'
  | 'CANONICAL_VICTIM'
  | 'SENSORY_WITNESS'
  | 'FATAL_PLACEMENT_AGENT'
  | 'ACCIDENTAL_WITNESS';

/** Relational matrix entry */
export interface RelationValue {
  from: CharacterId;
  to: CharacterId;
  value: number;   // -100 to +100
  label: string;   // qualifier e.g. "dette", "honteux"
}
