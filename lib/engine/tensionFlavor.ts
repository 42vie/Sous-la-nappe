// Les personnages ne sont pas figés : leur description réagit à la
// tension sociale accumulée pendant la soirée (state.variable.socialTension).
// Exemple concret qui a motivé ce module : Yanis ne reste pas "il veut que
// ça aille bien" si tout le monde est tendu — il devient prudent avec ses
// blagues, il les choisit mieux.
import type { CharacterId } from '@/lib/types/characters'

type Tier = 'low' | 'med' | 'high'

function tierOf(tension: number): Tier {
  if (tension >= 65) return 'high'
  if (tension >= 35) return 'med'
  return 'low'
}

const FLAVOR: Record<CharacterId, Record<Tier, string>> = {
  maelys: {
    low: 'Elle a tout organisé.',
    med: 'Le sourire tient, mais elle revérifie la cuisine deux fois de trop.',
    high: 'Elle ne sourit plus vraiment. Elle regarde la porte de la cuisine plus souvent qu\'elle ne parle.',
  },
  noe: {
    low: 'Il arrive en retard.',
    med: 'Il s\'est calé dans un coin, il parle peu et observe le service.',
    high: 'Il cherche une sortie discrète, une excuse pour partir plus tôt.',
  },
  ines: {
    low: 'Elle regarde son frère.',
    med: 'Elle ne quitte plus son frère des yeux — quelque chose l\'inquiète chez lui ce soir.',
    high: 'Elle a arrêté de faire semblant de suivre la conversation. Elle ne regarde plus que lui.',
  },
  lucas: {
    low: 'Il sait déjà trop.',
    med: 'Il pèse chaque mot avant de le dire, ce qui n\'est jamais bon signe chez lui.',
    high: 'Il a cette immobilité particulière qu\'il a quand il a compris quelque chose qu\'il ne dira pas.',
  },
  sarah: {
    low: 'Elle essaie de sourire.',
    med: 'Elle sent quelque chose, sans savoir quoi — une gêne diffuse qu\'elle n\'arrive pas à nommer.',
    high: 'Elle a ce sourire trop appuyé de quelqu\'un qui sent que ça ne va pas et refuse d\'y penser.',
  },
  yanis: {
    low: 'Il veut que ça aille bien.',
    med: 'Il fait toujours des blagues, mais il choisit mieux ses cibles ce soir.',
    high: 'Il a arrêté de plaisanter. Il surveille les visages avant de parler.',
  },
}

export function getTensionFlavor(character: CharacterId, tension: number): string {
  return FLAVOR[character][tierOf(tension)]
}
