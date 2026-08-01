// Bilan de la soirée — épilogue physique, piloté par la fin obtenue et
// affiné par la tension sociale accumulée (state.variable.socialTension).
// Depuis la réécriture F0-F8 (bible narrative étendue, 2026-08-01), c'est
// l'EndingId qui détermine QUI est touché (Noé en canon F0/F6/F7/F8, Sarah
// en F1, Inès en F2, les deux en F3, Maëlys elle-même en F4, personne en
// F5) — la tension ne module plus que la gravité, pas la cible.
import type { RunState } from '@/types'
import type { CharacterId } from '@/lib/types/characters'
import type { EndingId } from '@/lib/types/endings'

export type CharacterCondition = 'indemne' | 'ebranle' | 'blesse' | 'critique' | 'decede'

export interface EpilogueCharacterStatus {
  character: CharacterId
  condition: CharacterCondition
  detail: string
}

export interface Epilogue {
  gravity: number // 0–100
  headline: string
  paragraph: string
  statuses: EpilogueCharacterStatus[]
}

const ALL_CHARACTERS: CharacterId[] = ['maelys', 'noe', 'ines', 'lucas', 'sarah', 'yanis']

const LABELS: Record<CharacterId, string> = {
  maelys: 'Maëlys', noe: 'Noé', ines: 'Inès', lucas: 'Lucas', sarah: 'Sarah', yanis: 'Yanis',
}

const FEMININE: Set<CharacterId> = new Set(['maelys', 'ines', 'sarah'])
const heShe = (c: CharacterId) => (FEMININE.has(c) ? 'elle' : 'il')

/** Qui est physiquement touché par chaque fin — le cœur de la réécriture F0-F8. */
const ENDING_VICTIMS: Record<EndingId, CharacterId[]> = {
  F0: ['noe'],
  F1: ['sarah'],
  F2: ['ines'],
  F3: ['sarah', 'ines'],
  F4: ['maelys'],
  F5: [],
  F6: ['noe'],
  F7: ['noe'],
  F8: ['noe'],
}

// Bump de gravité propre à certaines fins, au-delà de la tension seule :
// F8 est déjà la plus sombre par nature, F3 touche deux personnes à la fois.
const ENDING_GRAVITY_BUMP: Partial<Record<EndingId, number>> = {
  F3: 10,
  F8: 15,
}

// F0/F6/F7/F8 tiennent tous sur l'invariant central de la réécriture :
// Noé survit. La tension peut faire monter la gravité de son épisode
// jusqu'au coma artificiel, jamais jusqu'à sa mort — sinon ce ne serait
// plus ces fins-là.
const MUST_SURVIVE_ENDINGS: Set<EndingId> = new Set(['F0', 'F6', 'F7', 'F8'])

function medicalTier(gravity: number, mustSurvive: boolean): { condition: CharacterCondition; label: string } {
  if (gravity < 25) return { condition: 'ebranle', label: 'malaise passager, remis·e sur pied dans la soirée' }
  if (gravity < 45) return { condition: 'blesse', label: 'hospitalisé·e quelques heures, hors de danger' }
  if (gravity < 65) return { condition: 'critique', label: "hospitalisé·e, plusieurs jours d'observation, pronostic incertain la première nuit" }
  if (gravity < 85 || mustSurvive) return { condition: 'critique', label: 'plongé·e dans un coma artificiel, pronostic réservé — mais vivant·e' }
  return { condition: 'decede', label: "n'a pas survécu à cette nuit" }
}

export function buildEpilogue(state: RunState): Epilogue {
  const tension = state.variable.socialTension ?? 0
  const ending = state.ending ?? 'F0'
  const bump = ENDING_GRAVITY_BUMP[ending] ?? 0
  const gravity = Math.max(0, Math.min(100, tension + bump))

  const victims = ENDING_VICTIMS[ending] ?? []
  const statuses: EpilogueCharacterStatus[] = ALL_CHARACTERS.map((c) => ({
    character: c,
    condition: 'indemne' as CharacterCondition,
    detail: 'Présent·e, indemne.',
  }))
  const setStatus = (c: CharacterId, condition: CharacterCondition, detail: string) => {
    const entry = statuses.find((s) => s.character === c)
    if (entry) {
      entry.condition = condition
      entry.detail = detail
    }
  }

  // F5 — personne n'est physiquement touché : la gravité se lit dans la
  // fracture sociale du groupe, pas dans un bilan médical.
  if (victims.length === 0) {
    let headline: string
    let paragraph: string
    if (gravity < 30) {
      headline = 'Un désaccord, vite refermé'
      paragraph = "La soirée s'est arrêtée avant d'aller au bout. Un malaise, une gêne — mais rien qui ne survive à la nuit. Personne n'a rien prouvé. Personne n'a rien nié non plus."
    } else if (gravity < 60) {
      headline = 'Une rupture publique'
      paragraph = "L'accusation est sortie devant tout le monde, sans preuve suffisante pour la tenir. Le groupe s'est fracturé sur place — pas de sang, mais plus personne ne se regarde tout à fait pareil."
      setStatus('lucas', 'ebranle', 'A accusé publiquement, sans preuve suffisante pour être cru.')
    } else {
      headline = 'Une fracture totale'
      paragraph = "L'accusation a explosé la soirée avant même que l'incident n'ait lieu. Personne n'est blessé, mais le groupe ne survit pas à ce qui vient d'être dit — certains ne se reparleront plus jamais."
      setStatus('lucas', 'ebranle', "A tout arrêté, seul contre tous, sans certitude d'avoir raison.")
    }
    return { gravity, headline, paragraph, statuses }
  }

  const tier = medicalTier(gravity, MUST_SURVIVE_ENDINGS.has(ending))
  for (const victim of victims) {
    setStatus(victim, tier.condition, capitalise(LABELS[victim]) + ' — ' + tier.label + '.')
  }

  const names = victims.map((v) => LABELS[v])
  const nameList = names.length > 1 ? `${names[0]} et ${names[1]}` : names[0]
  const pronoun = victims.length > 1 ? 'elles' : heShe(victims[0])

  let headline: string
  if (tier.condition === 'ebranle') headline = 'Un malaise, vite refermé'
  else if (tier.condition === 'blesse') headline = 'Une ambulance, une nuit d’observation'
  else if (tier.condition === 'critique' && gravity < 65) headline = "Plusieurs jours d'observation"
  else if (tier.condition === 'critique') headline = 'Le pronostic reste réservé'
  else headline = "Une nuit dont on ne revient pas"

  const paragraph = victims.length > 1
    ? `${nameList} ont fini par recevoir la charge, l'une comme l'autre — ${pronoun} ${tier.label}. Ce qui devait rester un incident ciblé s'est transformé en catastrophe collective.`
    : `${nameList} a fini par recevoir ce qui n'était pas censé lui arriver — ${pronoun} ${tier.label}. ${nameList === 'Noé' ? "Sa survie ouvre une vérité plus sale que sa mort n'en aurait ouvert : tout le monde doit maintenant vivre avec ce qu'il sait, ce qu'il soupçonne, et ce qu'il choisit de ne pas dire." : "Le reste du groupe repart avec ce qu'il a vu, ou refusé de voir."}`

  return { gravity, headline, paragraph, statuses }
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
