// Plan de table déduit — affiché à l'accueil, avant de choisir un
// personnage. Ce n'est pas le plan de table réel de la partie en cours
// (ça, c'est SeatingPlan.tsx pendant le jeu) : c'est ce que le JOUEUR sait
// reconstituer avec ce qu'il a débloqué jusqu'ici. Un personnage déjà
// incarné (povHistory) est placé avec certitude à sa vraie place au moment
// critique. Un personnage jamais incarné est placé à sa place prévue par
// Maëlys — la meilleure supposition disponible — qui peut se révéler fausse
// une fois qu'on l'incarne (c'est le cas d'Inès et Sarah dans le run T0).
import type { RunState } from '@/types'
import type { CharacterId } from '@/lib/types/characters'
import { BASE_SEATING } from '@/lib/types/house'
import type { SeatingSnapshot } from '@/lib/types/house'

export interface DeducedCharacterSeat {
  character: CharacterId
  seat: number | null
  confirmed: boolean
  hint: string
}

function findSeat(character: CharacterId, snapshot: SeatingSnapshot): number | null {
  const entry = Object.entries(snapshot).find(([, c]) => c === character)
  return entry ? Number(entry[0]) : null
}

const ALL_CHARACTERS: CharacterId[] = ['maelys', 'noe', 'ines', 'lucas', 'sarah', 'yanis']

const LABELS: Record<CharacterId, string> = {
  maelys: 'Maëlys', noe: 'Noé', ines: 'Inès', lucas: 'Lucas', sarah: 'Sarah', yanis: 'Yanis',
}

export function getDeducedSeating(run: (RunState & { povHistory?: CharacterId[] }) | null): DeducedCharacterSeat[] {
  if (!run) {
    return ALL_CHARACTERS.map((character) => ({
      character,
      seat: null,
      confirmed: false,
      hint: 'Aucune soirée en cours. Choisissez un personnage pour commencer à reconstituer la table.',
    }))
  }

  const history = run.variable?.seatingHistory
  const assumed: SeatingSnapshot = history?.seating_planned ?? BASE_SEATING
  const trueSeating: SeatingSnapshot =
    history?.seating_after_incident ?? history?.seating_at_critical ?? history?.seating_before_main ?? assumed

  const povHistory = run.povHistory ?? [run.playerPov]
  const elle = (c: CharacterId) => (c === 'sarah' || c === 'ines' || c === 'maelys' ? 'elle' : 'il')

  // Les sièges des personnages confirmés (connus avec certitude) sont posés
  // en premier : on ne peut pas placer un inconnu sur une chaise qu'on sait
  // déjà occupée par quelqu'un d'autre — ça arrive dès qu'un personnage
  // confirmé occupe la place "supposée" d'un personnage encore inconnu
  // (le cas d'Inès/Sarah, qui échangent leurs places dans le run T0).
  const confirmedSeats = new Set<number>()
  for (const character of ALL_CHARACTERS) {
    if (povHistory.includes(character)) {
      const seat = findSeat(character, trueSeating)
      if (seat) confirmedSeats.add(seat)
    }
  }

  return ALL_CHARACTERS.map((character) => {
    const confirmed = povHistory.includes(character)
    if (confirmed) {
      return {
        character,
        seat: findSeat(character, trueSeating),
        confirmed: true,
        hint: `Vous avez incarné ${LABELS[character]} — vous savez avec certitude où ${elle(character)} était au moment critique.`,
      }
    }

    const assumedSeat = findSeat(character, assumed)
    // La place supposée est déjà prise par quelqu'un de confirmé : on sait
    // donc que la supposition est fausse, sans savoir où est la vraie place.
    if (assumedSeat && confirmedSeats.has(assumedSeat)) {
      return {
        character,
        seat: null,
        confirmed: false,
        hint: `Vous savez que ${LABELS[character]} n'était pas à la place attendue — quelqu'un d'autre s'y trouvait vraiment. Incarnez-${elle(character) === 'elle' ? 'la' : 'le'} pour découvrir où ${elle(character)} était.`,
      }
    }

    return {
      character,
      seat: assumedSeat,
      confirmed: false,
      hint: `Vous n'avez jamais vu la soirée par les yeux de ${LABELS[character]}. Cette place est une supposition — elle peut être fausse.`,
    }
  })
}
