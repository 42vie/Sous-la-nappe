// Store Zustand — état du run en cours
import { create } from 'zustand'
import type { RunState } from '@/types'
import { updateRun } from '@/lib/firebase/runs'

interface RunStore {
  run: RunState | null
  isLoading: boolean
  error: string | null

  // Actions
  setRun: (run: RunState) => void
  clearRun: () => void
  updateRunLocal: (updates: Partial<RunState>) => void
  syncToFirestore: () => Promise<void>
  discoverClue: (clueRef: string) => void
  recordChoice: (sceneKey: string, choice: string) => void
  setFlag: (flag: string, value: boolean | number | string) => void
}

export const useRunStore = create<RunStore>((set, get) => ({
  run: null,
  isLoading: false,
  error: null,

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
      await updateRun(run.id, run)
    } catch (err) {
      set({ error: 'Erreur de synchronisation' })
      console.error('[syncToFirestore]', err)
    }
  },

  discoverClue: (clueRef) =>
    set((state) => {
      if (!state.run) return {}
      if (state.run.discoveredClues.includes(clueRef)) return {}
      return {
        run: {
          ...state.run,
          discoveredClues: [...state.run.discoveredClues, clueRef],
          updatedAt: Date.now(),
        },
      }
    }),

  recordChoice: (sceneKey, choice) =>
    set((state) => ({
      run: state.run
        ? {
            ...state.run,
            sceneChoices: { ...state.run.sceneChoices, [sceneKey]: choice },
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
}))
