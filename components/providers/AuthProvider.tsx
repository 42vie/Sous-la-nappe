'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

/**
 * À placer dans app/layout.tsx.
 * Démarre l'écoute onAuthStateChanged au montage et nettoie à l'unmount.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const init = useAuthStore((s) => s._init)

  useEffect(() => {
    const unsubscribe = init()
    return unsubscribe
  }, [init])

  return <>{children}</>
}
