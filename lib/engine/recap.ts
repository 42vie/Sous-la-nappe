// Le vrai récap de la soirée — pas un texte générique par palier de
// tension, mais la liste concrète des moments marquants qui se sont
// effectivement produits pendant CETTE partie, attribués au bon
// personnage (celui qui jouait réellement ce chapitre-là, pas
// systématiquement "Lucas" — les noms de flags datent du run à un seul
// personnage mais l'acteur réel se retrouve via povHistory/chapters).
import type { RunState } from '@/types'
import type { CharacterId } from '@/lib/types/characters'
import type { SceneId } from '@/lib/types/scenes'
import { getChapterNumberForScene } from './chapters'

const LABELS: Record<CharacterId, string> = {
  maelys: 'Maëlys', noe: 'Noé', ines: 'Inès', lucas: 'Lucas', sarah: 'Sarah', yanis: 'Yanis',
}

function actorFor(state: RunState, sceneId: SceneId): CharacterId | null {
  const chapterNum = getChapterNumberForScene(sceneId)
  if (!chapterNum) return null
  return state.povHistory?.[chapterNum - 1] ?? null
}

const FEMININE: Set<CharacterId> = new Set(['maelys', 'ines', 'sarah'])

function who(state: RunState, sceneId: SceneId): { name: string; il: string } {
  const actor = actorFor(state, sceneId)
  const name = actor ? LABELS[actor] : 'Quelqu’un'
  const il = actor ? (FEMININE.has(actor) ? 'elle' : 'il') : 'il'
  return { name, il }
}

interface FlagRecapRule {
  flag: string
  scene: SceneId
  line: (who: { name: string; il: string }) => string
}

const RULES: FlagRecapRule[] = [
  { flag: 'lucas_a_reecouté_vocal', scene: 'scene_01_opening_memory', line: (w) => `${w.name} a réécouté le vocal qu'${w.il} n'avait jamais effacé.` },
  { flag: 'lucas_a_vu_reflet', scene: 'scene_06_kitchen_aside', line: (w) => `${w.name} a vu, dans le reflet de la vitre du cellier, un geste que Maëlys ne voulait montrer à personne.` },
  { flag: 'lucas_a_note_echange_places', scene: 'scene_07_social_game_2', line: (w) => `${w.name} a remarqué l'échange de places entre Inès et Sarah, sans réagir sur le moment.` },
  { flag: 'lucas_a_interrompu_morpion', scene: 'scene_05_social_game_1', line: (w) => `${w.name} a pris la place de Sarah dans le jeu du salon — Yanis a fini par servir à sa place.` },
  { flag: 'lucas_temoin_service_silencieux', scene: 'scene_08_critical_service', line: (w) => `${w.name} a vu le service se dérouler sans intervenir — un silence qui pèsera plus tard.` },
  { flag: 'lucas_a_interrompu_service', scene: 'scene_08_critical_service', line: (w) => `${w.name} a interrompu le service et pris l'assiette de Sarah — la chaîne s'est brisée là.` },
  { flag: 'lucas_silence_moral', scene: 'scene_10_aftermath', line: (w) => `${w.name} a choisi le silence face à la version qui se construisait.` },
  { flag: 'lucas_a_parle', scene: 'scene_10_aftermath', line: (w) => `${w.name} a pris la parole — pas tout dit, mais assez pour que ça compte.` },
  { flag: 'lucas_confrontation_finale', scene: 'scene_11_reconstruction', line: (w) => `${w.name} a confronté Maëlys en tête-à-tête, juste avant de partir.` },
]

export function buildRecap(state: RunState): string[] {
  const lines: string[] = []

  for (const rule of RULES) {
    if (state.flags[rule.flag]) {
      lines.push(rule.line(who(state, rule.scene)))
    }
  }

  if (state.variable.seatingVariant === 'swapB') {
    lines.push('Inès et Sarah ont échangé leurs places pendant le service — un déplacement que Maëlys n’avait pas prévu.')
  }

  if (state.variable.serviceHelper && state.variable.serviceHelper !== 'sarah' && state.variable.serviceHelper !== 'maelys') {
    lines.push(`${LABELS[state.variable.serviceHelper]} a fini par servir les assiettes, pas Sarah.`)
  }

  const tension = state.variable.socialTension ?? 0
  if (tension >= 70) {
    lines.push('La tension dans la maison n’est jamais vraiment redescendue, ce soir-là.')
  } else if (tension <= 15 && lines.length > 0) {
    lines.push('Malgré tout ça, la soirée est restée étonnamment calme en surface.')
  }

  return lines
}
