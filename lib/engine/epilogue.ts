// Bilan de la soirée — épilogue physique, calculé depuis la fin obtenue et
// la tension sociale accumulée (state.variable.socialTension). Ce n'est
// jamais gratuit : c'est la conséquence directe de ce qui a été laissé
// monter (ou pas) pendant la partie. Plus la pression est haute, plus le
// bilan humain à la fin de la nuit est lourd.
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

// La fin obtenue pèse sur le bilan en plus de la tension brute : une fin
// « silence total » referme les choses, une fin d'accélération ou de
// confrontation les fait exploser.
const ENDING_GRAVITY_BUMP: Partial<Record<EndingId, number>> = {
  F1: -15,
  F2: 0,
  F3: 0,
  F4: 15,
  F5: 25,
  D1: 10,
  D2: 10,
  S1: 5,
}

const ALL_CHARACTERS: CharacterId[] = ['maelys', 'noe', 'ines', 'lucas', 'sarah', 'yanis']

const LABELS: Record<CharacterId, string> = {
  maelys: 'Maëlys',
  noe: 'Noé',
  ines: 'Inès',
  lucas: 'Lucas',
  sarah: 'Sarah',
  yanis: 'Yanis',
}

/** Second personnage touché par l'aggravation — le témoin ou celui qui a servi, jamais Sarah ni Maëlys. */
function pickSecondaryCasualty(state: RunState): CharacterId {
  const candidate = state.variable.witnessOfCriticalMove ?? state.variable.serviceHelper
  if (candidate && candidate !== 'sarah' && candidate !== 'maelys') return candidate
  return ALL_CHARACTERS.find((c) => c !== 'sarah' && c !== 'maelys') ?? 'yanis'
}

export function buildEpilogue(state: RunState): Epilogue {
  const tension = state.variable.socialTension ?? 0
  const bump = ENDING_GRAVITY_BUMP[state.ending ?? 'F1'] ?? 0
  const gravity = Math.max(0, Math.min(100, tension + bump))

  const secondary = pickSecondaryCasualty(state)
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

  let headline: string
  let paragraph: string

  if (gravity < 25) {
    headline = 'Un malaise, vite refermé'
    paragraph = "Sarah a eu un malaise passager. Le service a continué, la soirée a repris son cours presque normalement. Tout le monde est reparti sur ses deux jambes — et c'est peut-être ça, le plus inquiétant."
    setStatus('sarah', 'ebranle', 'Malaise passager, remise sur pied dans la soirée.')
  } else if (gravity < 45) {
    headline = 'Une ambulance, une nuit d’observation'
    paragraph = "Sarah a été emmenée aux urgences. Elle est hors de danger, mais personne dans la maison n'a vraiment dormi cette nuit-là. Les autres sont repartis indemnes — sonnés, mais indemnes."
    setStatus('sarah', 'blesse', 'Hospitalisée quelques heures, hors de danger.')
  } else if (gravity < 65) {
    headline = 'Plusieurs jours d’observation'
    paragraph = `Sarah a été hospitalisée, plusieurs jours d'observation, le pronostic incertain la première nuit. ${LABELS[secondary]} est parti·e avant le dessert, en larmes — une rupture nette avec le reste du groupe, dont personne n'a reparlé depuis.`
    setStatus('sarah', 'critique', "Hospitalisée, plusieurs jours d'observation.")
    setStatus(secondary, 'ebranle', 'Rupture nette avec le reste du groupe, ce soir-là.')
  } else if (gravity < 85) {
    headline = 'Deux départs en urgence, la même nuit'
    paragraph = `Sarah a été plongée dans un coma artificiel, le pronostic réservé. Dans la confusion qui a suivi, ${LABELS[secondary]} s'est blessé·e — une chute, un geste de trop, personne ne sait vraiment reconstituer l'ordre. Deux ambulances sont reparties de la maison cette nuit-là.`
    setStatus('sarah', 'critique', 'Coma artificiel, pronostic réservé.')
    setStatus(secondary, 'blesse', 'Blessé·e dans la confusion qui a suivi.')
  } else {
    headline = 'Deux ambulances, une seule est revenue vide'
    paragraph = `Sarah n'a pas survécu à cette nuit. ${LABELS[secondary]}, gravement blessé·e dans le chaos qui a suivi, reste hospitalisé·e dans un état critique. Ce que le groupe racontera de cette soirée ne dira jamais vraiment ce qui s'est passé — ni pourquoi personne n'a rien vu venir.`
    setStatus('sarah', 'decede', "N'a pas survécu à cette nuit.")
    setStatus(secondary, 'critique', 'Gravement blessé·e, état critique.')
  }

  return { gravity, headline, paragraph, statuses }
}
