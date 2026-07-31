// Moteur de scènes — chargeur + résolveur de conditions
import type { RunState, TransitionResult } from '@/types'
import type { SceneData, SceneChoice, ChoiceEffect } from '@/lib/types/scenes'
import scenesRaw from '@/data/scenes.json'
import { resolveClues } from './clueResolver'
import { resolveTransition } from './transitions'
import { hasFlag } from './flags'

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
    minigameToLaunch: scene.minigameId,
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
      const current = (charState as Record<string, unknown>)[effect.key]
      if (typeof current === 'number') {
        ;(charState as unknown as Record<string, number>)[effect.key] = Math.max(
          0,
          Math.min(100, current + effect.delta)
        )
      }
    }

    if (effect.type === 'seating_update' && effect.key && effect.value) {
      const seatingKey = effect.key as keyof RunState['variable']['seatingHistory']
      variableUpdates.seatingHistory = {
        ...state.variable.seatingHistory,
        [seatingKey]: state.variable.seatingHistory[seatingKey],
      }
    }

    if (effect.type === 'flag_set' && effect.key === 'survivingNarrative' && effect.value) {
      variableUpdates.survivingNarrative = effect.value as RunState['variable']['survivingNarrative']
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
