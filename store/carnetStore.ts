// Store Zustand — état persistant du Carnet (succès + fragments d'histoire)
// Hydraté depuis Firestore à l'ouverture du Carnet, pas depuis localStorage.
import { create } from 'zustand'

interface CarnetStore {
  unlockedAchievements: Set<string>
  unlockedStoryBlocks: Set<string>
  setUnlocked: (achIds: string[], storyIds: string[]) => void
}

export const useCarnetStore = create<CarnetStore>((set) => ({
  unlockedAchievements: new Set(),
  unlockedStoryBlocks: new Set(),
  setUnlocked: (achIds, storyIds) =>
    set({ unlockedAchievements: new Set(achIds), unlockedStoryBlocks: new Set(storyIds) }),
}))
