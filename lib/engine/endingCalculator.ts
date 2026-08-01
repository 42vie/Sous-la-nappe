// Calcul de la fin selon l'état du run — taxonomie F0-F8, réécrite depuis
// la bible narrative étendue (2026-08-01). F0 est la nouvelle fin
// canonique : Noé reçoit l'assiette visée, fait une détresse sévère, part
// à l'hôpital, survit — et sa survie ouvre une vérité plus sale que sa
// mort n'en aurait ouvert. Les anciennes fins déviées (D1/D2) et secrète
// (S1) sont repliées dans la nouvelle taxonomie : mêmes déclencheurs,
// nouveaux noms — voir ENDING_TRIGGERS pour le détail affichable au joueur.
import type { RunState } from '@/types'
import type { EndingId } from '@/lib/types/endings'
import type { CharacterId } from '@/lib/types/characters'
import type { ClueId } from '@/lib/types/clues'
import { isRunComplete } from './transitions'
import { clueScoreRatio } from './clueScoring'
import { mutualTrustRatio } from './backstory'
import { dynamicMutualTrustRatio } from './mutualTrust'

/** Indices dont la présence assemble le dossier post-hôpital (photo, vocal, carnet). */
const KEY_EVIDENCE_CLUES: ClueId[] = ['C-19', 'C-20', 'C-22']

function discoveredClueSet(state: RunState): Set<ClueId> {
  return new Set(state.discoveredClues.map((dc) => dc.clueId))
}

function hasKeyEvidence(state: RunState): boolean {
  const discovered = discoveredClueSet(state)
  return KEY_EVIDENCE_CLUES.some((id) => discovered.has(id)) || Boolean(state.flags['yanis_photo_vue'])
}

// E1-E3 (docs/roadmap-v2-expansion.md §2, §4) — payoff des intrigues
// parallèles A/B/C, toutes des variantes de la branche Noé (F0/F6/F7/F8) :
// Noé survit dans les trois cas, mais ce qui ressort après coup change de
// sens. Vérifiées dans l'ordre A→B→C ; la première qui matche l'emporte,
// avant même F7/F8/F6, parce qu'elle raconte une histoire plus précise que
// "quelqu'un a parlé" ou "le récit faux a tenu".
const DEBT_CLUES: ClueId[] = ['C-26', 'C-27', 'C-28', 'C-29']
const PAST_CLUES: ClueId[] = ['C-30', 'C-31', 'C-32']

function isCoCoupableInes(state: RunState): boolean {
  const discovered = discoveredClueSet(state)
  const debtRevealed = DEBT_CLUES.some((id) => discovered.has(id))
  // Un seul personnage par chapitre : Inès ne peut pas à la fois voir les
  // boîtes (S06, chapitre 2) ET tenir son silence en aftermath (S10,
  // chapitre 4) dans le même run — les deux flags sont donc alternatifs,
  // pas cumulatifs, chacun suffisant s'il tombe sur le chapitre qu'elle joue.
  const inesComplice = Boolean(state.flags['ines_vu_boites']) || Boolean(state.flags['ines_silence_actif'])
  return debtRevealed && inesComplice
}

function isSolidariteToxique(state: RunState): boolean {
  const discovered = discoveredClueSet(state)
  const pastRevealed = PAST_CLUES.some((id) => discovered.has(id))
  return pastRevealed && Boolean(state.flags['sarah_couvre_maelys'])
}

function isPreuveEffacee(state: RunState): boolean {
  return Boolean(state.flags['maelys_a_su_photo']) && !state.flags['yanis_photo_vue']
}

// Rééquilibrage F5 (2026-08-01) : dans la structure à 110 actions, chacun
// des trois moments de rupture (interrompre le morpion en scène 5,
// interrompre le service en scène 8, confronter en scène 11) est devenu
// disponible pour n'importe quel personnage, avec ~50% de chances d'être
// choisi à chaque fois. En cascade OR pure, ça faisait mécaniquement
// dominer F5 (~80% en simulation) : agir sans preuve devenait presque
// toujours la fin, peu importe ce que le joueur avait vraiment reconstitué.
//
// La correction, demandée explicitement : garder la matrice de points par
// indice (clueScoreRatio, clueScoring.ts) comme générateur du score de
// reconstitution, et faire peser "le regard qu'on a sur les autres et vice
// versa" — la matrice relationnelle (mutualTrustRatio, backstory.ts) —
// dans le calcul. Un personnage qui interrompt ou confronte n'aboutit à la
// rupture ambiguë F5 que s'il n'a NI assez reconstitué (peu d'indices, peu
// de poids) NI assez de crédit auprès du groupe (relations mutuelles
// faibles) : agir avec de quoi étayer son geste — preuves ou confiance du
// groupe — laisse la mécanique aller à son terme, et c'est alors ce qui se
// passe réellement (targetActual) et ce qui se dit après qui tranchent la
// fin, pas l'interruption elle-même. F5 reste possible — logiquement,
// c'est même la fin la plus commune d'un personnage lucide mais isolé ou
// peu informé — mais elle cesse d'écraser tout le reste.
const STANDING_THRESHOLD = 0.34
const STANDING_CLUE_WEIGHT = 0.55
const STANDING_TRUST_WEIGHT = 0.45

/** POV du chapitre N (1-indexé), avec repli sur le POV courant si l'historique est incomplet. */
function povForChapter(state: RunState, chapterNumber: number): CharacterId {
  return state.povHistory[chapterNumber - 1] ?? state.playerPov
}

/**
 * "Standing" d'une tentative d'interruption/confrontation : combien le
 * personnage qui agit a-t-il de quoi étayer son geste, entre ce qu'il/elle
 * a effectivement reconstitué (clueScoreRatio, la matrice) et le crédit que
 * le groupe lui accorde mutuellement (mutualTrustRatio, la matrice
 * relationnelle). 0..1.
 */
// Le crédit relationnel combine le passif (mutualTrustRatio, la matrice
// figée d'avant-soirée) et le vécu (dynamicMutualTrustRatio, mutualTrust.ts,
// qui bouge à chaque confrontation/silence/aide en jeu). Le vécu pèse plus
// lourd : ce qu'on a fait CE soir compte plus, pour juger si un geste
// tient, que ce qu'on pensait de vous avant d'arriver.
const TRUST_STATIC_WEIGHT = 0.4
const TRUST_DYNAMIC_WEIGHT = 0.6

function interventionStanding(state: RunState, actor: CharacterId): number {
  const staticTrust = mutualTrustRatio(actor)
  const trust = state.variable.mutualTrust
    ? staticTrust * TRUST_STATIC_WEIGHT + dynamicMutualTrustRatio(state.variable.mutualTrust, actor) * TRUST_DYNAMIC_WEIGHT
    : staticTrust

  return (
    clueScoreRatio(state) * STANDING_CLUE_WEIGHT +
    trust * STANDING_TRUST_WEIGHT
  )
}

/**
 * Déterminer la fin en fonction de l'état final du run.
 *
 * Ordre de priorité :
 * 1. F5 — le service ou le morpion sont interrompus, ou une confrontation a
 *    lieu, mais seulement si le personnage qui agit n'a NI assez reconstitué
 *    (clueScoreRatio, la matrice de points) NI assez de crédit auprès du
 *    groupe (mutualTrustRatio, la matrice relationnelle) pour que son geste
 *    tienne — voir interventionStanding ci-dessous. Sinon la mécanique va à
 *    son terme et c'est la suite (2, 3) qui tranche.
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
  const tension = state.variable.socialTension ?? 0
  const targetActual = state.variable.targetActual ?? []
  const hitSarah = targetActual.includes('sarah')
  const hitInes = targetActual.includes('ines')
  const hitMaelys = targetActual.includes('maelys')

  // F5 — la mécanique s'arrête avant d'aller au bout, mais seulement si
  // celui ou celle qui interrompt/confronte n'a pas de quoi étayer son
  // geste (voir interventionStanding, en tête de fichier). Chaque moment de
  // rupture est porté par le POV du chapitre où il a lieu : le morpion
  // (scène 5) et le service (scène 8) sont dans des chapitres différents de
  // la confrontation finale (scène 11), donc potentiellement trois
  // personnages distincts, chacun jugé sur son propre crédit.
  const morpionHalts =
    !!flags['lucas_a_interrompu_morpion'] &&
    interventionStanding(state, povForChapter(state, 2)) < STANDING_THRESHOLD
  const serviceHalts =
    !!flags['lucas_a_interrompu_service'] &&
    interventionStanding(state, povForChapter(state, 3)) < STANDING_THRESHOLD
  const confrontationHalts =
    !!flags['lucas_confrontation_finale'] &&
    interventionStanding(state, povForChapter(state, 4)) < STANDING_THRESHOLD

  if (morpionHalts || serviceHalts || confrontationHalts) return 'F5'

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

  // E1 — le mobile financier de Noé sort au jour, et Inès savait depuis la
  // cuisine (S06) sans jamais rien dire : sa survie à lui expose sa
  // complicité à elle.
  if (isCoCoupableInes(state)) return 'E1'

  // E2 — Sarah connaissait le passé avec Maëlys avant ce soir, et choisit
  // quand même de partir sans rien dire : une solidarité qui protège la
  // mauvaise personne.
  if (isSolidariteToxique(state)) return 'E2'

  // E3 — Maëlys a su pour la photo de Yanis avant que quiconque d'autre ne
  // la voie : la preuve qui aurait pu tout changer disparaît avant de
  // compter.
  if (isPreuveEffacee(state)) return 'E3'

  // F7 — le dossier s'assemble (photo, vocal ou carnet) et quelqu'un a parlé.
  if (hasKeyEvidence(state) && flags['lucas_a_parle']) return 'F7'

  // F8 — fin noire : le récit qui sort écrase Sarah, dans une tension déjà
  // haute. Seuil recalibré (60 → 30) : en jeu réel, socialTension part de 0
  // et s'accumule par petits deltas (+/-2 à 12 par choix, +/-3/4 au mini-
  // jeu "lire la pièce") sur 11 scènes ; 60 n'était jamais atteint en
  // pratique (0% en simulation sur 1000+ runs), ce qui rendait F8
  // inaccessible hors état construit à la main. 30 reste le haut du
  // spectre observé (percentile ~85-90) : F8 reste la fin la plus dure à
  // obtenir de la branche Noé, mais elle redevient atteignable.
  if (state.variable.survivingNarrative === 'false_sarah_self_harm' && tension >= 30) return 'F8'

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
  E1: "Noé a survécu, mais le mobile financier qui pesait sur lui est sorti au jour — et Inès, qui avait vu de quoi il retournait dans la cuisine ou qui s'est tue une fois de trop en aftermath, s'est retrouvée complice par son silence.",
  E2: "Noé a survécu, mais Sarah connaissait un passé avec Maëlys que personne d'autre ne soupçonnait — et elle a choisi de partir sans rien dire, protégeant la mauvaise personne.",
  E3: "Noé a survécu, et la photo qui aurait pu tout prouver a existé — mais Maëlys en a su l'existence avant que quiconque d'autre ne la voie, et la preuve a disparu avant de compter.",
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
