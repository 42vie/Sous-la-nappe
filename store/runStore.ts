// Store Zustand — état du run en cours
import { create } from 'zustand'
import type { RunState } from '@/lib/types/engine'
import type { SceneId } from '@/lib/types/scenes'
import type { ClueId } from '@/lib/types/clues'
import { updateRun } from '@/lib/firebase/runs'
import { getScene } from '@/lib/engine/sceneRunner'

interface AdvanceResponse {
  ok: boolean
  nextScene: string | null
  cluesRevealed: string[]
  flagUpdates: Record<string, boolean | string | number>
  narrativeInjections: string[]
  minigameToLaunch: string | null
  isComplete: boolean
  ending: string | null
  tensionDelta: number
}

interface RunStore {
  run: RunState | null
  isLoading: boolean
  error: string | null
  lastResult: Omit<AdvanceResponse, 'ok'> | null

  setRun: (run: RunState) => void
  clearRun: () => void
  updateRunLocal: (updates: Partial<RunState>) => void
  syncToFirestore: () => Promise<void>
  discoverClue: (clueRef: string) => void
  recordChoice: (sceneKey: string, choice: string) => void
  setFlag: (flag: string, value: boolean | number | string) => void

  advance: (sceneId: string, choiceId: string) => Promise<AdvanceResponse | null>
  loadCurrentScene: () => Promise<{
    scene: {
      id: string
      index: number
      title: string
      narrative: string
      minigameId: string | null
      canonicalFacts: string[]
    }
    choices: { id: string; verb: string; label: string; description: string | null }[]
  } | null>
}

export const useRunStore = create<RunStore>((set, get) => ({
  run: null,
  isLoading: false,
  error: null,
  lastResult: null,

  setRun: (run) => set({ run, error: null }),
  clearRun: () => set({ run: null }),

  updateRunLocal: (updates) =>
    set((state) => ({
      run: state.run ? { ...state.run, ...updates } : null,
    })),

  syncToFirestore: async () => {
    const { run } = get()
    if (!run) return
    try {
      await updateRun(run.runId, run)
    } catch (err) {
      set({ error: 'Erreur de synchronisation' })
      console.error('[syncToFirestore]', err)
    }
  },

  discoverClue: (clueRef) =>
    set((state) => {
      if (!state.run) return {}
      const already = state.run.discoveredClues.some((dc) => dc.clueId === clueRef)
      if (already) return {}
      return {
        run: {
          ...state.run,
          discoveredClues: [
            ...state.run.discoveredClues,
            {
              clueId: clueRef as ClueId,
              discoveredByPov: state.run.playerPov,
              discoveredAtScene: getScene(state.run.currentScene)?.index ?? 0,
            },
          ],
        },
      }
    }),

  recordChoice: (sceneKey, choice) =>
    set((state) => ({
      run: state.run
        ? {
            ...state.run,
            sceneHistory: [
              ...state.run.sceneHistory,
              { sceneId: sceneKey as SceneId, choicesMade: [choice], cluesFound: [] as ClueId[], timestamp: Date.now(), narrativeNotes: [] },
            ],
          }
        : null,
    })),

  setFlag: (flag, value) =>
    set((state) => ({
      run: state.run
        ? { ...state.run, flags: { ...state.run.flags, [flag]: value } }
        : null,
    })),

  advance: async (sceneId, choiceId) => {
    const { run } = get()
    if (!run) return null
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/run/${run.runId}/advance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sceneId, choiceId }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erreur advance')
      }
      const data: AdvanceResponse = await res.json()

      set((state) => {
        if (!state.run) return { isLoading: false, lastResult: data }
        const newFlags = { ...state.run.flags, ...data.flagUpdates }
        const newClues = [
          ...state.run.discoveredClues,
          ...data.cluesRevealed.map((clueId) => ({
            clueId: clueId as ClueId,
            discoveredByPov: state.run!.playerPov,
            discoveredAtScene: getScene(sceneId)?.index ?? 0,
          })),
        ]
        return {
          isLoading: false,
          lastResult: data,
          run: {
            ...state.run,
            flags: newFlags,
            discoveredClues: newClues,
            currentScene: (data.nextScene as RunState['currentScene']) ?? state.run.currentScene,
            isComplete: data.isComplete,
            ending: (data.ending as RunState['ending']) ?? state.run.ending,
          },
        }
      })
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      set({ isLoading: false, error: message })
      console.error('[advance]', err)
      return null
    }
  },

  loadCurrentScene: async () => {
    const { run } = get()
    if (!run) return null
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`/api/run/${run.runId}/advance`)
      if (!res.ok) throw new Error('Erreur chargement scène')
      const data = await res.json()
      set({ isLoading: false })
      return data
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur inconnue'
      set({ isLoading: false, error: message })
      return null
    }
  },
}))
