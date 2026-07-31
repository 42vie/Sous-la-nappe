// "Ma vérité" — pour chaque personnage joué cette partie, ce qu'il/elle a
// choisi de faire pendant son chapitre. Construit uniquement à partir de
// sceneHistory (déjà enregistré) — aucune nouvelle donnée à stocker.
import { getScene } from './sceneRunner'
import { CHAPTERS } from './chapters'
import type { RunState } from '@/types'
import type { CharacterId } from '@/lib/types/characters'

export interface PovSummary {
  character: CharacterId
  chapterNumber: number
  chapterTitle: string
  choiceLabels: string[]
}

export function getPovSummaries(state: RunState): PovSummary[] {
  const povHistory = state.povHistory ?? [state.playerPov]

  return povHistory.map((character, i) => {
    const chapter = CHAPTERS[i]
    const choiceLabels: string[] = []

    if (chapter) {
      for (const sceneId of chapter.sceneIds) {
        const entry = state.sceneHistory.find((h) => h.sceneId === sceneId)
        if (!entry) continue
        const scene = getScene(sceneId)
        for (const choiceId of entry.choicesMade) {
          const choice = scene?.choices.find((c) => c.id === choiceId)
          if (choice) choiceLabels.push(choice.label)
        }
      }
    }

    return {
      character,
      chapterNumber: i + 1,
      chapterTitle: chapter?.title ?? '',
      choiceLabels,
    }
  })
}
