// Score de reconstitution — section 6 de README_CONTEXTE_MATRICES_2026-08-01.md
// ("Matrice de scoring par clue révélée"). Le document d'origine notait ce
// barème pour alimenter un questionnaire final à 8 questions ; on n'a pas
// de questionnaire (voir la suppression du QCM, script fixe) — le score se
// calcule directement depuis les indices réellement trouvés en jouant,
// sans étape déclarative en plus. Le barème par indice reste le même,
// c'est juste son déclenchement qui change.
import type { RunState } from '@/types'
import type { ClueId } from '@/lib/types/clues'

export const CLUE_POINTS: Record<ClueId, number> = {
  'C-01': 4,
  'C-02': 6,
  'C-03': 1,
  'C-04': 3,
  'C-05': 2,
  'C-06': 2,
  'C-07': 3,
  'C-08': 2,
  'C-09': 5,
  'C-10': 3,
  'C-11': 8,
  'C-12': 2,
  'C-13': 4,
  'C-14': 1,
  'C-15': 5,
  'C-16': 6,
  'C-17': 2,
  'C-18': 7,
  'C-19': 10,
  'C-20': 8,
  'C-21': 3,
  'C-22': 10,
  'C-23': 5,
  'C-24': 1,
  'C-25': 6,

  // Intrigues parallèles (docs/roadmap-v2-expansion.md, docs/expansion-v3) —
  // barème plus bas que le dossier canonique : ce sont des sous-intrigues,
  // pas les indices qui prouvent le mécanisme central de la soirée.
  'C-26': 3,
  'C-27': 2,
  'C-28': 3,
  'C-29': 2,
  'C-30': 1,
  'C-31': 2,
  'C-32': 1,
  'C-33': 1,
  'C-34': 2,
  'C-35': 4,
  'C-36': 3,
  'C-37': 2,

  // Scènes inter-chapitres (docs/expansion-v3-histoires-interactions.md, S01b-S09b)
  'C-38': 2,
  'C-39': 2,
  'C-40': 4,
  'C-41': 4,
  'C-42': 5,
  'C-43': 6,

  // Acte 0 (avant le dîner, docs/roadmap-v2-expansion.md §3)
  'C-44': 8,
  'C-45': 3,
  'C-46': 2,
}

/** Somme totale du barème — calculée, pas recopiée, pour ne jamais désynchroniser du tableau ci-dessus. */
export const MAX_CLUE_SCORE = Object.values(CLUE_POINTS).reduce((sum, pts) => sum + pts, 0)

/** Score de reconstitution 0–1, à partir des seuls indices réellement découverts dans le run. */
export function clueScoreRatio(state: RunState): number {
  const discovered = new Set(state.discoveredClues.map((dc) => dc.clueId))
  let total = 0
  for (const [clueId, pts] of Object.entries(CLUE_POINTS) as [ClueId, number][]) {
    if (discovered.has(clueId)) total += pts
  }
  return Math.max(0, Math.min(1, total / MAX_CLUE_SCORE))
}
