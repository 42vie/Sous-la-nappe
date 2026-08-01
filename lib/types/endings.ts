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
export type EndingId = 'F0' | 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8' | 'E1' | 'E2' | 'E3';

export interface EndingCondition {
  type: 'flag' | 'state' | 'variable' | 'pov';
  key: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
  value: string | number | boolean;
  combinator?: 'AND' | 'OR'; // how to combine with next condition
}
