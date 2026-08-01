// Calcul de la fin selon l'état du run — taxonomie F0-F8, réécrite depuis
// la bible narrative étendue (2026-08-01). F0 est la nouvelle fin
// canonique : Noé reçoit l'assiette visée, fait une détresse sévère, part
// à l'hôpital, survit — et sa survie ouvre une vérité plus sale que sa
// mort n'en aurait ouvert. Les anciennes fins déviées (D1/D2) et secrète
// (S1) sont repliées dans la nouvelle taxonomie : mêmes déclencheurs,
// nouveaux noms — voir ENDING_TRIGGERS pour le détail affichable au joueur.
import type { RunState } from '@/types'
import type { EndingId } from '@/lib/types/endings'
import type { ClueId } from '@/lib/types/clues'
import { countCriticalClues } from './clueResolver'
import { isRunComplete } from './transitions'

/** Indices dont la présence assemble le dossier post-hôpital (photo, vocal, carnet). */
const KEY_EVIDENCE_CLUES: ClueId[] = ['C-19', 'C-20', 'C-22']

function hasKeyEvidence(state: RunState): boolean {
  const discovered = new Set(state.discoveredClues.map((dc) => dc.clueId))
  return KEY_EVIDENCE_CLUES.some((id) => discovered.has(id))
}

/**
 * Déterminer la fin en fonction de l'état final du run.
 *
 * Ordre de priorité :
 * 1. F5 — le service ou le morpion sont interrompus, ou une confrontation a
 *    lieu sans preuve suffisante : la mécanique s'arrête avant d'aller au
 *    bout, personne n'est physiquement touché.
 * 2. Qui a été réellement atteint (targetActual, moteur de déviation,
 *    lib/engine/deviation.ts) détermine la branche principale :
 *    Maëlys elle-même → F4, Sarah et Inès → F3, Inès seule → F2,
 *    Sarah seule → F1, Noé (le cas par défaut, canon) → F0/F6/F7/F8.
 * 3. Dans la branche Noé, ce qui se passe APRÈS l'hôpital distingue les
 *    quatre issues : F7 si le dossier s'assemble et que quelqu'un parle,
 *    F8 si le récit qui sort écrase Sarah dans une tension déjà haute,
 *    F6 si le silence tient malgré tout, F0 sinon (fin canonique nette).
 */
export function calculateEnding(state: RunState): EndingId {
  if (!isRunComplete(state)) return 'F0'

  const flags = state.flags
  const criticalCount = countCriticalClues(state)
  const tension = state.variable.socialTension ?? 0
  const targetActual = state.variable.targetActual ?? []
  const hitSarah = targetActual.includes('sarah')
  const hitInes = targetActual.includes('ines')
  const hitMaelys = targetActual.includes('maelys')

  // F5 — la mécanique s'arrête avant d'aller au bout.
  if (
    flags['lucas_a_interrompu_service'] ||
    flags['lucas_a_interrompu_morpion'] ||
    (flags['lucas_confrontation_finale'] && criticalCount < 6)
  ) return 'F5'

  // F4 — Maëlys, ironiquement, atteinte par son propre dispositif : soit le
  // moteur de déviation l'a littéralement désignée (chance résiduelle dans
  // le chaos, voir resolveTargetActual), soit elle a servi elle-même sans
  // relais dans une soirée déjà trop tendue pour qu'elle garde la main sur
  // sa propre logistique. Vérifié avant F3 : si le chaos l'a désignée
  // elle, ce n'est plus une "double contamination", c'est l'auto-
  // contamination.
  if (hitMaelys || (state.variable.serviceHelper === 'maelys' && tension >= 70)) return 'F4'

  // F3 — double contamination : la variante de placement "chaos" (Yanis
  // relance tout le monde à changer de place) déborde le calcul normal à
  // une seule cible — la soirée devient catastrophe collective plutôt
  // qu'incident ciblé, qu'elle ait ou non touché Sarah/Inès individuellement.
  if (state.variable.seatingVariant === 'chaos' || (hitSarah && hitInes)) return 'F3'

  // F2 — erreur de correction : Inès prend la place de Noé.
  if (hitInes) return 'F2'

  // F1 — Sarah touchée, le récit faux s'impose.
  if (hitSarah) return 'F1'

  // Noé est la cible réellement atteinte — ce qui se passe après l'hôpital tranche.

  // F7 — le dossier s'assemble (photo, vocal ou carnet) et quelqu'un a parlé.
  if (hasKeyEvidence(state) && flags['lucas_a_parle']) return 'F7'

  // F8 — fin noire : le récit qui sort écrase Sarah, dans une tension déjà haute.
  if (state.variable.survivingNarrative === 'false_sarah_self_harm' && tension >= 60) return 'F8'

  // F6 — Noé survit mais le silence tient : personne n'a vraiment parlé.
  if (!flags['lucas_a_parle']) return 'F6'

  // F0 — fin canonique : Noé survit, la vérité ne peut plus être complètement enterrée.
  return 'F0'
}

/** Description courte, affichable au joueur, de ce qui a déclenché sa fin — la "matrice" de la bible en version lisible. */
export const ENDING_TRIGGERS: Record<EndingId, string> = {
  F0: "Noé a reçu l'assiette visée, a fait une détresse sévère, est parti à l'hôpital, et a survécu — sans qu'aucun autre déclencheur (interruption, preuve assemblée, silence total) ne prenne le dessus.",
  F1: "L'assiette visée n'a pas atteint Noé : elle a atteint Sarah. Le récit faux qui circule après coup s'est imposé sans contestation sérieuse.",
  F2: "L'assiette visée n'a pas atteint Noé : elle a atteint Inès, à la place initialement prévue avant tout déplacement.",
  F3: "L'assiette visée a fini par toucher Sarah et Inès à la fois — la soirée a basculé en catastrophe collective plutôt qu'en incident ciblé.",
  F4: "Le service a fini par se retourner contre Maëlys elle-même — la seule fin où elle est physiquement atteinte par son propre dispositif.",
  F5: "Le service ou le morpion ont été interrompus avant d'aller au bout, ou une confrontation a eu lieu sans réunir assez de preuves : personne n'est physiquement touché, mais le groupe se fracture avant toute certitude.",
  F6: "Noé a survécu à l'hôpital, mais personne n'a vraiment parlé — le silence a tenu, et la vérité est restée enterrée malgré la gravité de ce qui venait de se passer.",
  F7: "Noé a survécu, et assez de preuves matérielles (une photo, un vocal, un carnet) ont fini par s'assembler pendant que quelqu'un acceptait enfin de parler.",
  F8: "Noé a survécu, mais le récit qui est sorti de la maison a fini par écraser Sarah — dans une tension déjà montée trop haut pour que quiconque la défende.",
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
