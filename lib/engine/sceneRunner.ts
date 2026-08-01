// Moteur de scènes — chargeur + résolveur de conditions
import type { RunState, TransitionResult } from '@/types'
import type { SceneData, SceneChoice, ChoiceEffect } from '@/lib/types/scenes'
import scenesRaw from '@/data/scenes.json'
import { resolveClues } from './clueResolver'
import { resolveTransition } from './transitions'
import { hasFlag } from './flags'
import { BASE_SEATING, SWAP_B_SEATING } from '@/lib/types/house'
import type { SeatingSnapshot } from '@/lib/types/house'
import { resolveTargetActual } from './deviation'
import { applyChoiceTrustDelta } from './mutualTrust'

const SEATING_SNAPSHOTS: Record<string, SeatingSnapshot> = {
  base: BASE_SEATING,
  swapB: SWAP_B_SEATING,
}

const SCENES: SceneData[] = scenesRaw as unknown as SceneData[]

/** Charger une scène par ID */
export function getScene(sceneId: string): SceneData | null {
  return SCENES.find((s) => s.id === sceneId) ?? null
}

/** Charger une scène par index (1–11) */
export function getSceneByIndex(index: number): SceneData | null {
  return SCENES.find((s) => s.index === index) ?? null
}

/** Filtrer les choix disponibles pour un POV donné et un état de run */
export function getAvailableChoices(
  scene: SceneData,
  state: RunState
): SceneChoice[] {
  return scene.choices.filter((choice) => {
    // Filtre POV
    if (choice.availableFor !== 'all') {
      if (!choice.availableFor.includes(state.playerPov)) return false
    }
    // Filtre flag requis
    if (choice.requiresFlag && !hasFlag(state, choice.requiresFlag)) {
      return false
    }
    return true
  })
}

/** Appliquer les effets d'entrée d'une scène et retourner les mises à jour */
export function applyOnEnterEffects(
  scene: SceneData,
  state: RunState
): Partial<RunState> {
  if (!scene.onEnterEffects?.length) return {}
  return applyEffects(scene.onEnterEffects, state)
}

/** Appliquer un choix : effets + indices + progression */
export function applyChoice(
  scene: SceneData,
  choiceId: string,
  state: RunState
): TransitionResult {
  const choice = scene.choices.find((c) => c.id === choiceId)
  if (!choice) {
    return {
      nextScene: resolveTransition(scene, state),
      stateUpdates: {},
      flagUpdates: {},
      cluesRevealed: scene.autoRevealClues ?? [],
      narrativeInjections: [],
    }
  }

  const stateUpdates = applyEffects(choice.effects, state)

  // Confiance mutuelle vivante : ce que ce choix fait au regard du groupe
  // sur celui qui l'a fait (voir mutualTrust.ts) — indépendant des effects
  // déclarés dans scenes.json, dérivé directement du verbe de l'action.
  const baseTrust = state.variable.mutualTrust ?? undefined
  if (baseTrust) {
    const variable = stateUpdates.variable ?? state.variable
    stateUpdates.variable = {
      ...variable,
      mutualTrust: applyChoiceTrustDelta(baseTrust, state.playerPov, choice.verb),
    }
  }

  // Couche 4 du moteur de déviation (chapitre 12) : résolution de la cible
  // réellement atteinte, au moment du service critique.
  if (scene.id === 'scene_08_critical_service') {
    const variable = stateUpdates.variable ?? state.variable
    stateUpdates.variable = {
      ...variable,
      targetActual: resolveTargetActual({
        seatingVariant: variable.seatingVariant,
        serviceHelper: variable.serviceHelper,
        maelysControle: state.variable.characterState.maelysControle,
        maelysIntoxication: state.variable.characterState.maelysIntoxication,
        targetPlanned: state.variable.targetPlanned,
        seatingAtCritical: state.variable.seatingHistory.seating_at_critical,
      }),
    }
  }

  const flagUpdates: Record<string, boolean | string | number> = {}

  // Extraire les flag_set/flag_clear des effets
  for (const effect of choice.effects) {
    if ((effect.type === 'flag_set' || effect.type === 'flag_clear') && effect.key) {
      flagUpdates[effect.key] = effect.type === 'flag_set'
        ? (effect.value ?? true)
        : false
    }
  }

  const cluesRevealed = resolveClues(
    scene,
    choice,
    state
  )

  const nextScene = choice.nextScene !== undefined
    ? (choice.nextScene ?? null)
    : resolveTransition(scene, state)

  const narrativeInjections: string[] = []
  for (const effect of choice.effects) {
    if (effect.type === 'narrative_note' && effect.note) {
      narrativeInjections.push(effect.note)
    }
  }

  return {
    nextScene,
    stateUpdates,
    flagUpdates,
    cluesRevealed,
    narrativeInjections,
    // Le mini-jeu à lancer est celui de la scène qu'on rejoint, pas celui de
    // la scène qu'on quitte — sinon un choix fait après un mini-jeu (ex.
    // s05_c01/c02 après le morpion, s08_c01/c02 après le service) relance
    // le même mini-jeu en boucle au lieu de faire avancer la partie.
    minigameToLaunch: nextScene ? getScene(nextScene)?.minigameId : undefined,
  }
}

/** Appliquer une liste d'effets sur un RunState partiel */
function applyEffects(
  effects: ChoiceEffect[],
  state: RunState
): Partial<RunState> {
  const charState = { ...state.variable.characterState }
  const variableUpdates: Partial<RunState['variable']> = {}

  for (const effect of effects) {
    if (effect.type === 'state_delta' && effect.key && effect.delta !== undefined) {
      if (effect.key === 'socialTension') {
        // Tension collective — n'est pas un attribut par personnage
        // (characterState), c'est un compteur global de variable qui pilote
        // l'escalade des fins (voir endingCalculator.ts).
        const current = variableUpdates.socialTension ?? state.variable.socialTension ?? 0
        variableUpdates.socialTension = Math.max(0, Math.min(100, current + effect.delta))
      } else {
        const current = (charState as Record<string, unknown>)[effect.key]
        if (typeof current === 'number') {
          ;(charState as unknown as Record<string, number>)[effect.key] = Math.max(
            0,
            Math.min(100, current + effect.delta)
          )
        }
      }
    }

    if (effect.type === 'seating_update' && effect.key && effect.value) {
      const seatingKey = effect.key as keyof RunState['variable']['seatingHistory']
      const snapshot = SEATING_SNAPSHOTS[String(effect.value)] ?? BASE_SEATING
      variableUpdates.seatingHistory = {
        ...(variableUpdates.seatingHistory ?? state.variable.seatingHistory),
        [seatingKey]: snapshot,
      }
    }

    if (effect.type === 'flag_set' && effect.key === 'survivingNarrative' && effect.value) {
      variableUpdates.survivingNarrative = effect.value as RunState['variable']['survivingNarrative']
    }

    // Un choix peut faire basculer la variante de placement en cours de
    // partie (ex. Yanis fait changer tout le monde de place — chaos). C'est
    // distinct du snapshot visuel (seating_update, ci-dessus) : c'est ce
    // que endingCalculator.ts lit pour la fin F3.
    if (effect.type === 'flag_set' && effect.key === 'seatingVariant' && effect.value) {
      variableUpdates.seatingVariant = effect.value as RunState['variable']['seatingVariant']
    }
  }

  return {
    variable: {
      ...state.variable,
      ...variableUpdates,
      characterState: charState,
    },
  }
}
