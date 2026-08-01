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

export type EndingId = 'F0' | 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7' | 'F8';

export interface EndingCondition {
  type: 'flag' | 'state' | 'variable' | 'pov';
  key: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
  value: string | number | boolean;
  combinator?: 'AND' | 'OR'; // how to combine with next condition
}
