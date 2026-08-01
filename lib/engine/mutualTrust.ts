// Confiance mutuelle vivante — extension de la matrice relationnelle
// statique (backstory.ts, RELATIONSHIP_MATRIX). Cette dernière ne bouge
// jamais en jeu : c'est le passif des personnages avant la soirée. Ici on
// ajoute une couche qui, elle, réagit à ce que le joueur fait réellement.
// Une confrontation publique ébrèche le crédit qu'on vous accorde, une
// aide directe le renforce — voir docs/roadmap-v2-expansion.md §6.1.
import type { CharacterId } from '@/lib/types/characters'
import type { ActionVerb } from '@/lib/types/scenes'
import { RELATIONSHIP_MATRIX } from './backstory'

const ALL_CHARACTERS: CharacterId[] = ['maelys', 'noe', 'ines', 'lucas', 'sarah', 'yanis']

export type MutualTrustMatrix = Record<CharacterId, Partial<Record<CharacterId, number>>>

/** Point de départ : le passif relationnel (RELATIONSHIP_MATRIX), copié dans une structure modifiable en jeu. */
export function initialMutualTrust(): MutualTrustMatrix {
  const matrix = {} as MutualTrustMatrix
  for (const from of ALL_CHARACTERS) {
    matrix[from] = {}
    for (const to of ALL_CHARACTERS) {
      if (from === to) continue
      matrix[from]![to] = RELATIONSHIP_MATRIX[from]?.[to]?.value ?? 0
    }
  }
  return matrix
}

/** Combien un verbe d'action fait bouger le regard du groupe présent sur celui qui agit. */
const VERB_TRUST_DELTA: Partial<Record<ActionVerb, number>> = {
  confront: -15,
  intervene: -6,
  stay_silent: -8,
  let_pass: -3,
  help_service: 10,
}

/** Applique le delta de confiance d'une action à la matrice — retourne une nouvelle matrice (immutable). */
export function applyChoiceTrustDelta(
  matrix: MutualTrustMatrix,
  actor: CharacterId,
  verb: ActionVerb
): MutualTrustMatrix {
  const delta = VERB_TRUST_DELTA[verb]
  if (!delta) return matrix

  const next: MutualTrustMatrix = { ...matrix }
  for (const observer of ALL_CHARACTERS) {
    if (observer === actor) continue
    next[observer] = {
      ...next[observer],
      [actor]: clamp((next[observer]?.[actor] ?? 0) + delta),
    }
  }
  return next
}

function clamp(v: number): number {
  return Math.max(-100, Math.min(100, v))
}

/** Ratio 0..1 de la confiance moyenne que le groupe accorde à `actor`, telle qu'elle a évolué en jeu. */
export function dynamicMutualTrustRatio(matrix: MutualTrustMatrix, actor: CharacterId): number {
  const observers = ALL_CHARACTERS.filter((c) => c !== actor)
  const values = observers.map((o) => matrix[o]?.[actor] ?? 0)
  const avg = values.reduce((sum, v) => sum + v, 0) / values.length
  return Math.max(0, Math.min(1, (avg + 100) / 200))
}
