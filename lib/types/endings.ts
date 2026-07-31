/**
 * Endings — 5 main, 2 deviated, 1 secret
 * Strictly from chapter 13 of the PDF.
 */

export type EndingId = 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'D1' | 'D2' | 'S1';

export type EndingCategory = 'main' | 'deviated' | 'secret';

export interface EndingData {
  id: EndingId;
  category: EndingCategory;
  title: string;
  conditions: EndingCondition[];
  /** What the ending leaves the player with */
  playerTakeaway: string;
  /** Probability in canonical T0 flow */
  baseProbability: number; // 0–1
  /** Whether this should be presented as a 'good' ending — most are not */
  isGood: false | 'ambiguous';
}

export interface EndingCondition {
  type: 'flag' | 'state' | 'variable' | 'pov';
  key: string;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=';
  value: string | number | boolean;
  combinator?: 'AND' | 'OR'; // how to combine with next condition
}
