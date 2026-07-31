// Store Zustand — état du run en cours
import { create } from 'zustand'
import type { RunState, TransitionResult } from '@/types'
import { updateRun } from '@/lib/firebase/runs'

interface AdvanceResponse {
  ok: boolean
  nextScene: string | null
  cluesRevealed: string[]
  flagUpdates: Record<string, boolean | string | number>
  narrativeInjections: string[]
  minigameToLaunch: string | null
  isComplete: boolean
  ending: string | null
}

interface RunStore {
  run: RunState | null
  isLoading: boolean
  error: string | null
  lastResult: Omit<AdvanceResponse, 'ok'> | null

  // Actions existantes
  setRun: (run: RunState) => void
  clearRun: () => void
  updateRunLocal: (updates: Partial<RunState>) => void
  syncToFirestore: () => Promise<void>
  discoverClue: (clueRef: string) => void
  recordChoice: (sceneKey: string, choice: string) => void
  setFlag: (flag: string, value: boolean | number | string) => void

  // Actions moteur Sprint 2
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
      run: state.run ? { ...state.run, ...updates, updatedAt: Date.now() } : null,
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
            { clueId: clueRef, discoveredInScene: '', discoveredByChoice: '', discoveredAt: Date.now() },
          ],
          updatedAt: Date.now(),
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
              { sceneId: sceneKey, choicesMade: [choice], cluesFound: [], timestamp: Date.now(), narrativeNotes: [] },
            ],
            updatedAt: Date.now(),
          }
        : null,
    })),

  setFlag: (flag, value) =>
    set((state) => ({
      run: state.run
        ? {
            ...state.run,
            flags: { ...state.run.flags, [flag]: value },
            updatedAt: Date.now(),
          }
        : null,
    })),

  // --- Sprint 2 : appel API moteur ---

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

      // Mettre à jour le store local avec les flags et indices reçus
      set((state) => {
        if (!state.run) return { isLoading: false, lastResult: data }
        const newFlags = { ...state.run.flags, ...data.flagUpdates }
        const newClues = [
          ...state.run.discoveredClues,
          ...data.cluesRevealed.map((clueId) => ({
            clueId,
            discoveredInScene: sceneId,
            discoveredByChoice: choiceId,
            discoveredAt: Date.now(),
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
            updatedAt: Date.now(),
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
