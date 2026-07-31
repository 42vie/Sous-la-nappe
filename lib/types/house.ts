/**
 * House topology — La Mésangère
 * Every room defines visibility rules and narrative function.
 */

export type RoomId =
  | 'dining_room'
  | 'pass_through'  // le passe — the mechanical heart
  | 'kitchen'
  | 'living_room'
  | 'terrace'
  | 'hallway_bathroom'
  | 'upstairs';

export interface RoomData {
  id: RoomId;
  label: string;
  narrativeFunction: string;
  visibilityRule: string;
  accessibleTo: 'all' | 'maelys_only' | 'pairs' | 'none_direct';
}

/** Seat positions at the table — 1 to 6, left-right, passe side = right */
export type SeatId = 1 | 2 | 3 | 4 | 5 | 6;

export interface SeatAssignment {
  seatId: SeatId;
  characterId: CharacterId | null;
}

import type { CharacterId } from './characters';

export type SeatingVariant = 'base' | 'swapA' | 'swapB' | 'chaos';

export type SeatingStateKey =
  | 'seating_planned'
  | 'seating_before_main'
  | 'seating_at_critical'
  | 'seating_after_incident';

export type SeatingSnapshot = Record<SeatId, CharacterId | null>;

export interface SeatingHistory {
  seating_planned: SeatingSnapshot;
  seating_before_main: SeatingSnapshot;
  seating_at_critical: SeatingSnapshot;
  seating_after_incident: SeatingSnapshot;
}

/**
 * Canonical base seating (seatingVariant = base):
 * Seat 1: Maëlys  Seat 2: Noé    (passe side)
 * Seat 3: Sarah   Seat 4: Inès
 * Seat 5: Lucas   Seat 6: Yanis  (kitchen side)
 */
export const BASE_SEATING: SeatingSnapshot = {
  1: 'maelys',
  2: 'noe',
  3: 'sarah',
  4: 'ines',
  5: 'lucas',
  6: 'yanis',
};

/**
 * swapB: Inès and Sarah exchange (canon T0 at 21h44)
 */
export const SWAP_B_SEATING: SeatingSnapshot = {
  1: 'maelys',
  2: 'noe',
  3: 'ines',   // swapped
  4: 'sarah',  // swapped
  5: 'lucas',
  6: 'yanis',
};
