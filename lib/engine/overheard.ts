// Conversations entendues — remplace le mini-jeu audio prévu par la bible
// (MVP-4, scènes 10-11) par du texte : une bribe différente selon le
// personnage joué, et dont la lisibilité se dégrade avec son ivresse.
// L'alcool ne fait pas que brouiller l'écoute : ce qui est dit par les
// autres, à ce stade de la soirée, est aussi plus franc que ça ne le
// serait à jeun — la désinhibition est écrite dans le texte source.
import type { RunState } from '@/types'
import type { CharacterId } from '@/lib/types/characters'
import type { SceneId } from '@/lib/types/scenes'

const CONVERSATIONS: Partial<Record<SceneId, Partial<Record<CharacterId, string>>>> = {
  scene_10_aftermath: {
    maelys: "Depuis le couloir, tu entends Inès et Yanis dans la cuisine : « ...elle a toujours été comme ça, non ? un peu intense... » Personne ne baisse la voix pour toi. Personne n'y pense.",
    noe: "Tu entends Inès au téléphone, dans l'entrée : « ...non, tout va bien, enfin, il y a eu un souci, mais tout va bien... » Elle ment avec le même calme que toi.",
    ines: "Tu entends Yanis essayer d'expliquer aux secours ce qu'il a vu, et se reprendre à chaque phrase. Personne ne l'aide à finir ses phrases.",
    lucas: "Tu entends Yanis dire, à personne en particulier : « je te jure j'ai entendu un truc en arrivant, personne me croit. » Tu pourrais le confirmer. Tu ne dis rien.",
    sarah: "Tu entends des voix, dehors, qui parlent de toi à la troisième personne. « Elle », « son état », « depuis combien de temps ». Aucune ne s'adresse à toi.",
    yanis: "Tu vois Lucas et Maëlys se regarder dans le couloir, longtemps, sans un mot. Tu ne comprends pas ce que ce silence-là contient. Tu sens juste que ce n'est pas rien.",
  },
}

/** Impairment 0–100 : alcool ambiant + intoxication propre à Maëlys si jouée. */
export function computeImpairment(state: RunState, pov: CharacterId): number {
  const cs = state.variable.characterState
  const ambient = cs.yanisAlcoolCollectif ?? 0
  const personal = pov === 'maelys' ? (cs.maelysIntoxication ?? 0) : 0
  return Math.max(0, Math.min(100, ambient * 0.6 + personal * 0.4))
}

/**
 * Brouille un mot en mélangeant ses lettres du milieu (la première et la
 * dernière restent en place — un mot reste lisible avec l'effort, à la
 * façon dont on déchiffre encore un mot dont on connaît le sens même
 * mélangé). Sert à rendre un choix trouble sous forte tension : pas
 * illisible, juste plus dur à lire d'un coup d'œil.
 */
function scrambleWord(word: string): string {
  if (word.length <= 3) return word
  const chars = word.split('')
  const middle = chars.slice(1, -1)
  for (let i = middle.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[middle[i], middle[j]] = [middle[j], middle[i]]
  }
  return chars[0] + middle.join('') + chars[chars.length - 1]
}

/** Mélange une partie des mots d'un texte selon une intensité 0–1 — jamais la ponctuation ni les mots courts. */
export function scrambleText(text: string, intensity: number): string {
  if (intensity <= 0) return text
  return text
    .split(' ')
    .map((w) => (w.length > 3 && Math.random() < intensity ? scrambleWord(w) : w))
    .join(' ')
}

/** Dégrade un texte selon un niveau d'ivresse — mots avalés, phrase qui se perd. */
export function garbleText(text: string, impairment: number): string {
  if (impairment < 15) return text

  const dropRate = Math.min(0.6, impairment / 140) // jusqu'à ~60% des mots à haute ivresse
  const words = text.split(' ')
  const result = words.map((w) => {
    // Ne jamais toucher la ponctuation de dialogue seule ou les mots très courts
    if (w.length <= 2) return w
    return Math.random() < dropRate ? '…' : w
  })

  // Au-delà d'un certain seuil, la phrase se coupe avant la fin.
  if (impairment > 70) {
    const cutAt = Math.max(4, Math.floor(result.length * 0.55))
    return result.slice(0, cutAt).join(' ') + '…'
  }

  return result.join(' ')
}

export function getOverheardConversation(
  sceneId: string,
  pov: CharacterId,
  state: RunState
): string | null {
  const clean = CONVERSATIONS[sceneId as SceneId]?.[pov]
  if (!clean) return null
  const impairment = computeImpairment(state, pov)
  return garbleText(clean, impairment)
}
