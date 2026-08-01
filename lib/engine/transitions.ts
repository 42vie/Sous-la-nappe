// Calcul de la scène suivante
import type { RunState } from '@/types'
import type { SceneData, SceneId } from '@/lib/types/scenes'

/**
 * Règle par défaut : scène suivante = index + 1
 * Cas particuliers :
 * - Si la scène n'a pas de suivante (scène 11), retourner null
 * - Si un flag force une bifurcation, l'appliquer
 */
// Ordre de jeu complet — les scènes "b" (expansion v3, docs/expansion-v3-
// histoires-interactions.md) sont insérées entre les 11 scènes d'origine,
// pas ajoutées à la fin : la scène suivante se lit par position dans ce
// tableau, plus par arithmétique sur `index` (qui reste un simple numéro
// d'affichage 1..N, cf. scene.index dans data/scenes.json).
const SCENE_ORDER: SceneId[] = [
  'scene_00a_preparation_cuisine',
  'scene_00b_appel_de_noe',
  'scene_00c_arrivee_ines_en_avance',
  'scene_01_opening_memory',
  'scene_01b_conversation_palier',
  'scene_02_arrival',
  'scene_02b_telephone_yanis',
  'scene_03_first_exchanges',
  'scene_03b_confidence_sarah',
  'scene_04_seating',
  'scene_04b_echange_regards',
  'scene_05_social_game_1',
  'scene_05b_remarque_ines',
  'scene_06_kitchen_aside',
  'scene_06b_lucas_yanis_dehors',
  'scene_07_social_game_2',
  'scene_07b_demande_noe_lucas',
  'scene_08_critical_service',
  'scene_09_incident',
  'scene_09b_couloir_incident',
  'scene_10_aftermath',
  'scene_11_reconstruction',
  'scene_12_couloir_hopital',
  'scene_13_retour_de_maelys',
  'scene_14_lendemain_matin',
]

/**
 * La "branche Noé" (F0/F6/F7/F8 dans endingCalculator.ts, Acte 3 ici)
 * s'applique-t-elle ? Mêmes conditions de garde que le calcul des fins —
 * dupliquées ici plutôt qu'importées pour éviter un cycle (endingCalculator
 * importe déjà isRunComplete depuis ce fichier). targetActual n'a jamais
 * qu'un seul élément (resolveTargetActual, deviation.ts), donc ces
 * vérifications sont mutuellement exclusives.
 */
function isNoeBranch(state: RunState): boolean {
  const targetActual = state.variable.targetActual ?? []
  const tension = state.variable.socialTension ?? 0

  if (targetActual.includes('maelys') || (state.variable.serviceHelper === 'maelys' && tension >= 70)) return false
  if (state.variable.seatingVariant === 'chaos') return false
  if (targetActual.includes('ines') || targetActual.includes('sarah')) return false
  return targetActual.includes('noe')
}

export function resolveTransition(
  scene: SceneData,
  state: RunState
): SceneId | null {
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

  // Acte 3 (docs/roadmap-v2-expansion.md §3) : seulement si Noé a
  // effectivement reçu l'assiette — dans toute autre branche (F1-F5), la
  // reconstruction (scène 11) reste la vraie fin du run.
  if (scene.id === 'scene_11_reconstruction') {
    return isNoeBranch(state) ? 'scene_12_couloir_hopital' : null
  }

  const pos = SCENE_ORDER.indexOf(scene.id)
  if (pos === -1 || pos === SCENE_ORDER.length - 1) return null
  return SCENE_ORDER[pos + 1]
}

/** Vérifier si un run est arrivé à son terme — la dernière scène dépend de
 * si l'Acte 3 s'est déclenché (scène 14) ou non (scène 11). */
export function isRunComplete(state: RunState): boolean {
  if (state.flags['run_complete']) return true
  const finalScene: SceneId = isNoeBranch(state) ? 'scene_14_lendemain_matin' : 'scene_11_reconstruction'
  return state.currentScene === finalScene && state.completedScenes.includes(finalScene)
}
