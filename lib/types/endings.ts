/**
 * Endings — 9 fins (F0-F8).
 * Réécriture depuis la bible narrative étendue (2026-08-01, PJ utilisateur) :
 * F0 devient la fin canonique ("Noé à l'hôpital, il survit") remplaçant
 * l'ancien défaut F1 ("Sarah, récit falsifié"). Les anciennes fins déviées
 * D1/D2/S1 sont repliées dans la nouvelle taxonomie : leurs déclencheurs
 * (interruption du service, du morpion, confrontation finale) alimentent
 * désormais F5 ; les conditions de l'ancienne fin secrète S1 (indices
 * critiques + confrontation + parole) alimentent F7.
 */

// E1-E3 : payoff des intrigues parallèles (docs/roadmap-v2-expansion.md §2,
// §4) — des variantes de la branche Noé (F0/F6/F7/F8) où ce qui sort après
// coup n'est plus seulement "Noé a survécu" mais une complicité ou une
// preuve qui change le sens de cette survie. Voir endingCalculator.ts.
//
// F9, F13, F14, F_SAMU_TOT, F_INES_PIVOT, F_YANIS_PART : phase 5 de
// l'expansion (docs/roadmap-v2-expansion.md §4, docs/expansion-v3 §nouvelles
// conditions de fins) — noms conservés tels quels depuis les docs pour ne
// pas entrer en collision avec F10/F11/F12/F15 (Inès, Maëlys, Noé, multi-run)
// pas encore implémentées.
//
// F_SARAH_MORT, F_NOE_DISPARAIT, F_SARAH_RETOURNE, F_SARAH_SAIT_ET_COUVRE,
// F_RUPTURE_FINALE : l'histoire croisée Sarah/Noé (docs/expansion-v4, volet
// B) — l'Acte 3 (scène 14) peut se refermer sur cinq issues distinctes
// selon ce que Sarah choisit de faire, une fois qu'elle sait. F_SARAH_MORT
// est la première fin du jeu où un personnage meurt réellement — voir
// epilogue.ts, ENDING_VICTIMS et le cas spécial dans buildEpilogue.
export type EndingId =
  | 'F0' | 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8'
  | 'E1' | 'E2' | 'E3'
  | 'F9' | 'F13' | 'F14' | 'F_SAMU_TOT' | 'F_INES_PIVOT' | 'F_YANIS_PART'
  | 'F_SARAH_MORT' | 'F_NOE_DISPARAIT' | 'F_SARAH_RETOURNE' | 'F_SARAH_SAIT_ET_COUVRE' | 'F_RUPTURE_FINALE'
  | 'F_NOE_MORT_SILENCE' | 'F_NOE_MORT_VERITE' | 'F_NOE_MORT_RECIT_FAUX';

export interface EndingCondition {
  type: 'flag' | 'state' | 'variable' | 'pov';
  key: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
  value: string | number | boolean;
  combinator?: 'AND' | 'OR'; // how to combine with next condition
}
