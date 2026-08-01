/**
 * Clues — 25 items from chapter 11 of the PDF (C-01 à C-25, le chapitre
 * annonçait "26 indices" dans son titre mais n'en détaillait que 25 —
 * coquille du document source).
 * C-26 à C-37 : ajoutés par l'expansion des intrigues parallèles
 * (docs/roadmap-v2-expansion.md §2, docs/expansion-v3-histoires-interactions.md)
 * — hors PDF d'origine, branchés sur des choix existants des scènes S01-S11.
 * C-38 à C-43 : ajoutés par les scènes inter-chapitres de l'expansion v3
 * (S01b à S09b, docs/expansion-v3-histoires-interactions.md).
 * C-44 à C-46 : ajoutés par l'Acte 0 (scènes 00a-00c, avant le dîner,
 * docs/roadmap-v2-expansion.md §3).
 * fiabilite: 'low' | 'medium' | 'high' | 'very_high'
 * The 'misleads' field is the most important column: what it makes you believe (often wrong).
 */

export type ClueId =
  | 'C-01' | 'C-02' | 'C-03' | 'C-04' | 'C-05'
  | 'C-06' | 'C-07' | 'C-08' | 'C-09' | 'C-10'
  | 'C-11' | 'C-12' | 'C-13' | 'C-14' | 'C-15'
  | 'C-16' | 'C-17' | 'C-18' | 'C-19' | 'C-20'
  | 'C-21' | 'C-22' | 'C-23' | 'C-24' | 'C-25'
  | 'C-26' | 'C-27' | 'C-28' | 'C-29' | 'C-30'
  | 'C-31' | 'C-32' | 'C-33' | 'C-34' | 'C-35'
  | 'C-36' | 'C-37' | 'C-38' | 'C-39' | 'C-40'
  | 'C-41' | 'C-42' | 'C-43' | 'C-44' | 'C-45'
  | 'C-46';

export type ClueReliability = 'low' | 'medium' | 'high' | 'very_high';

export interface ClueData {
  id: ClueId;
  label: string;
  location: string;
  accessibleTo: string;   // who can find it
  reliability: ClueReliability;
  proves: string;         // what it actually proves
  misleads: string;       // what it makes the player believe (often wrong)
  /** Internal hidden reliability score — not shown to player */
  _hiddenScore: number;  // 0–100
}

/** A clue discovered in a run */
export interface DiscoveredClue {
  clueId: ClueId;
  discoveredByPov: import('./characters').CharacterId;
  discoveredAtScene: number;
  playerInterpretation?: string; // what the player noted
}
