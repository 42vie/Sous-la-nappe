// Store Zustand — état d'authentification
import { create } from 'zustand'
import type { User } from 'firebase/auth'
import { onAuth } from '@/lib/firebase/auth'

interface AuthStore {
  user: User | null
  isLoading: boolean
  isReady: boolean   // true une fois que onAuth a émis au moins une valeur
  _init: () => () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  isReady: false,

  _init: () => {
    const unsubscribe = onAuth((user) => {
      set({ user, isLoading: false, isReady: true })
    })
    return unsubscribe
  },
}))
