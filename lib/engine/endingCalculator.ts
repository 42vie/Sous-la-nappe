// Calcul de la fin selon l'état du run
import type { RunState } from '@/types'
import type { EndingId } from '@/lib/types/endings'
import { countCriticalClues } from './clueResolver'
import { isRunComplete } from './transitions'

/**
 * Déterminer la fin en fonction de l'état final du run.
 *
 * Fins disponibles :
 * F1 — Canon : silence complet, narrative = false_sarah_self_harm
 * F2 — Témoin partiel : Lucas parle mais incomplètement
 * F3 — Vérité incomplète : truth_partial, peu d'indices
 * F4 — Confrontation : Lucas confronte Maëlys
 * F5 — Accélération : Lucas interrompt le service + vocal utilisé
 * D1 — Déviée 1 : Lucas prend l'assiette de Sarah
 * D2 — Déviée 2 : Lucas interrompt le morpion
 * S1 — Secrète : tous les indices critiques + confrontation
 */
export function calculateEnding(state: RunState): EndingId {
  if (!isRunComplete(state)) return 'F1'

  const criticalCount = countCriticalClues(state)
  const flags = state.flags

  // Fin secrète : tout vu, confrontation finale
  if (
    criticalCount >= 6 &&
    flags['lucas_a_parle'] &&
    flags['lucas_confrontation_finale']
  ) return 'S1'

  // Déviée 1 : Lucas a pris l'assiette
  if (flags['lucas_a_interrompu_service']) return 'D1'

  // Déviée 2 : Lucas a interrompu le morpion
  if (flags['lucas_a_interrompu_morpion']) return 'D2'

  // F5 : vocal utilisé + service interrompu
  if (flags['lucas_a_reecouté_vocal'] && flags['lucas_a_parle']) return 'F5'

  // F4 : confrontation mais sans avoir tout dit
  if (flags['lucas_confrontation_finale']) return 'F4'

  // Au-delà des déclencheurs explicites ci-dessus, la tension sociale
  // accumulée pendant la soirée (state.variable.socialTension, 0–100)
  // pousse vers une sortie plus dramatique même sans confrontation directe :
  // plus la pression est montée, plus la fin est dure.
  const tension = state.variable.socialTension
  if (tension >= 70) return 'F5'
  if (tension >= 45) return 'F4'

  // F2 : Lucas a parlé, narrative = truth_partial
  if (
    flags['lucas_a_parle'] &&
    state.variable.survivingNarrative === 'truth_partial'
  ) return 'F2'

  // F3 : truth_partial mais Lucas n'a pas vraiment parlé
  if (
    state.variable.survivingNarrative === 'truth_partial' &&
    criticalCount >= 3
  ) return 'F3'

  // F1 : défaut — silence moral, narrative false_sarah_self_harm
  return 'F1'
}

/**
 * Construire le rapport final (3 colonnes) à partir du RunState
 */
export function buildFinalReport(state: RunState) {
  const v = state.variable
  return {
    planned: {
      targetWho: capitalise(v.targetPlanned),
      targetWhy: 'Trahison financière et émotionnelle',
      mechanism: 'Sauce dosée, position dans la file du passe',
      whoKnew: 'Maëlys seule',
      whatsaid: 'Soirée de réconciliation',
    },
    actual: {
      targetWho: v.targetActual.map(capitalise).join(', '),
      targetWhy: buildActualReason(v),
      mechanism: `${capitalise(v.serviceHelper)} a servi les assiettes dans l'ordre du passe`,
      whoKnew: v.witnessOfCriticalMove ? `${capitalise(v.witnessOfCriticalMove)} (silence moral)` : 'Personne',
      whatsaid: buildNarrativeLine(v.survivingNarrative),
    },
    narrated: {
      targetWho: 'Personne — accident',
      targetWhy: 'Fragilité, médicaments, stress',
      mechanism: 'Incohérence avec le traitement',
      whoKnew: 'Tout le groupe, dans la version sortie',
      whatsaid: narrativeLabel(v.survivingNarrative),
    },
  }
}

function buildActualReason(v: RunState['variable']): string {
  const parts: string[] = []
  if (v.seatingVariant !== 'base') parts.push(`placement modifié (${v.seatingVariant})`)
  if (v.serviceHelper !== 'maelys') parts.push(`${capitalise(v.serviceHelper)} au service`)
  return parts.length ? parts.join(', ') : 'Chaîne défaillances simultanées'
}

function buildNarrativeLine(n: RunState['variable']['survivingNarrative']): string {
  switch (n) {
    case 'truth_complete': return 'La vérité complète a été dite'
    case 'truth_partial': return 'Une version partielle avec des trous'
    case 'false_sarah_self_harm': return 'Fragilité de Sarah, mélange médicamenteux'
    case 'accident_food': return 'Incident alimentaire'
    case 'collective_silence': return 'Silence collectif'
  }
}

function narrativeLabel(n: RunState['variable']['survivingNarrative']): string {
  return buildNarrativeLine(n)
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
