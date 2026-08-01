// Moteur de déviation — couches 1–5
import type { HostIntent, SeatingVariant, CharacterId, TargetPlanned } from '@/types'
import type { SeatId, SeatingSnapshot } from '@/lib/types/house'

/**
 * Couche 1 — Détermination du plan de Maëlys
 */
export function resolveHostIntent(
  maelysControle: number,
  maelysColere: number
): HostIntent {
  if (maelysControle > 65 && maelysColere > 60) return 'kill_one'
  if (maelysControle > 55 && maelysColere >= 35) return 'sicken'
  return 'humiliate'
}

/**
 * Couche 3 — Probabilité de déplacement de sièges
 * Retourne la variante de placement qui résulte des variables
 */
export function resolveSeatingVariant(
  socialTension: number,
  yanisJeuSocial: number
): SeatingVariant {
  const rand = Math.random()

  // Si la tension est élevée ET Yanis est très actif socialement
  if (socialTension > 60 && yanisJeuSocial > 60) {
    if (rand < 0.18) return 'chaos'
    if (rand < 0.52) return 'swapB'   // canon T0
    if (rand < 0.82) return 'swapA'
    return 'base'
  }

  if (socialTension > 60) {
    if (rand < 0.34) return 'swapB'
    if (rand < 0.64) return 'swapA'
    if (rand < 0.82) return 'chaos'
    return 'base'
  }

  // Base par défaut (tension faible)
  if (rand < 0.18) return 'base'
  if (rand < 0.48) return 'swapA'
  if (rand < 0.82) return 'swapB'
  return 'chaos'
}

/**
 * Couche 4 — Facteur g(serviceHelper)
 * Coefficient de probabilité que la cible prévue soit atteinte
 */
export const SERVICE_HELPER_FACTOR: Record<string, number> = {
  maelys: 1.00,
  lucas:  0.72,
  yanis:  0.55,
  noe:    0.50,
  ines:   0.44,
  sarah:  0.38,  // canon T0
}

/**
 * Couche 4 — Résolution complète de la cible atteinte
 */
export function resolveTargetActual(
  state: {
    seatingVariant: SeatingVariant
    serviceHelper: CharacterId
    maelysControle: number
    maelysIntoxication: number
    targetPlanned: TargetPlanned
    seatingAtCritical: SeatingSnapshot
  }
): CharacterId[] {
  // Variante chaos : Yanis a fait changer tout le monde de place. Dans ce
  // désordre, il existe une chance résiduelle que ce soit Maëlys
  // elle-même qui se retrouve avec l'assiette qu'elle a préparée — la
  // "chute ironique" décrite dans la bible narrative étendue (fin F4).
  if (state.seatingVariant === 'chaos' && Math.random() < 0.2) {
    return ['maelys']
  }

  // Probabilité de base selon la variante de sièges
  const baseRisk: Record<SeatingVariant, number> = {
    base:  0.12,
    swapA: 0.45,
    swapB: 0.60,
    chaos: 0.78,
  }

  const gFactor = SERVICE_HELPER_FACTOR[state.serviceHelper] ?? 0.5
  const controlFactor = (state.maelysControle / 100) * (1 - state.maelysIntoxication / 200)

  const pTargetAtteinte = baseRisk[state.seatingVariant] * gFactor * controlFactor

  const rand = Math.random()

  // Si la probabilité est faible, la cible prévue est atteinte
  if (rand > pTargetAtteinte) {
    return [state.targetPlanned]
  }

  // Sinon, déterminer la cible réelle selon le plan de table
  const criticalSeating = state.seatingAtCritical
  const targetSeat = Object.entries(criticalSeating).find(
    ([, charId]) => charId === state.targetPlanned
  )

  if (!targetSeat) return [state.targetPlanned]

  // La cible est la personne assise à la place 4 au moment critique — c'est
  // la position que Maëlys a marquée pour Noé (scène 8 : « La position 4
  // était censée être Noé. La position 4 est maintenant Sarah. »). Seules
  // les places 3/4 varient entre BASE_SEATING et SWAP_B_SEATING (Inès et
  // Sarah s'y échangent) ; la place 2 ne varie jamais, donc l'utiliser ici
  // rendait la déviation structurellement impossible à atteindre.
  const actualSeatId: SeatId = 4
  return [criticalSeating[actualSeatId] ?? state.targetPlanned]
}
