// Dépôt et déverrouillage d'indices
import type { RunState } from '@/types'
import type { SceneData, SceneChoice } from '@/lib/types/scenes'
import type { ClueId } from '@/lib/types/clues'

/**
 * Calculer tous les indices révélés par un choix donné dans une scène
 * = autoRevealClues de la scène + revealsClue du choix (si conditions remplies)
 */
export function resolveClues(
  scene: SceneData,
  choice: SceneChoice,
  state: RunState
): ClueId[] {
  const clues: ClueId[] = []

  // Indices automatiques de la scène
  if (scene.autoRevealClues) {
    for (const clueId of scene.autoRevealClues) {
      if (!isAlreadyDiscovered(clueId, state)) {
        clues.push(clueId)
      }
    }
  }

  // Indice spécifique au choix
  if (choice.revealsClue && !isAlreadyDiscovered(choice.revealsClue, state)) {
    clues.push(choice.revealsClue)
  }

  return clues
}

/** Vérifier si un indice est déjà dans les indices découverts du run */
export function isAlreadyDiscovered(
  clueId: ClueId,
  state: RunState
): boolean {
  return state.discoveredClues.some(
    (dc) => dc.clueId === clueId
  )
}

/** Construire un objet DiscoveredClue pour ajout dans le run */
export function buildDiscoveredClue(
  clueId: ClueId,
  sceneId: string,
  choiceId: string
): { clueId: ClueId; discoveredInScene: string; discoveredByChoice: string; discoveredAt: number } {
  return {
    clueId,
    discoveredInScene: sceneId,
    discoveredByChoice: choiceId,
    discoveredAt: Date.now(),
  }
}

/**
 * Indices critiques du run Lucas — leur présence/absence conditionne les fins
 */
export const CRITICAL_CLUES: ClueId[] = [
  'C-09', // petit récipient en grès
  'C-11', // reflet dans la vitre du cellier
  'C-15', // trace sur bord d'assiette
  'C-18', // absence pilulier
  'C-19', // photo horodatée Yanis
  'C-20', // vocal Maëlys
  'C-25', // ordre des phrases de Noé
]

/** Calculer le score d'indices critiques (0–7) */
export function countCriticalClues(state: RunState): number {
  return CRITICAL_CLUES.filter((clueId) =>
    isAlreadyDiscovered(clueId, state)
  ).length
}
