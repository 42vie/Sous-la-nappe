// Calcul de la scène suivante
import type { RunState } from '@/types'
import type { SceneData, SceneId } from '@/lib/types/scenes'

/**
 * Règle par défaut : scène suivante = index + 1
 * Cas particuliers :
 * - Si la scène n'a pas de suivante (scène 11), retourner null
 * - Si un flag force une bifurcation, l'appliquer
 */
export function resolveTransition(
  scene: SceneData,
  state: RunState
): SceneId | null {
  const nextIndex = scene.index + 1
  if (nextIndex > 11) return null

  // Bifurcation : si Lucas a interrompu le service, on saute l'incident standard
  if (
    scene.id === 'scene_08_critical_service' &&
    state.flags['lucas_a_interrompu_service']
  ) {
    // L'incident se produit quand même mais différemment
    return 'scene_09_incident'
  }

  // Bifurcation : confrontation finale après scène 10
  if (
    scene.id === 'scene_10_aftermath' &&
    state.flags['lucas_confrontation_finale']
  ) {
    return 'scene_11_reconstruction'
  }

  const SCENE_ORDER: SceneId[] = [
    'scene_01_opening_memory',
    'scene_02_arrival',
    'scene_03_first_exchanges',
    'scene_04_seating',
    'scene_05_social_game_1',
    'scene_06_kitchen_aside',
    'scene_07_social_game_2',
    'scene_08_critical_service',
    'scene_09_incident',
    'scene_10_aftermath',
    'scene_11_reconstruction',
  ]

  return SCENE_ORDER[nextIndex - 1] ?? null
}

/** Vérifier si un run est arrivé à son terme */
export function isRunComplete(state: RunState): boolean {
  return Boolean(state.flags['run_complete']) ||
    state.currentScene === 'scene_11_reconstruction' &&
    state.completedScenes.includes('scene_11_reconstruction')
}
