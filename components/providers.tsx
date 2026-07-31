'use client'

import { useEffect } from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  // Initialisation du thème (dark mode)
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    document.documentElement.setAttribute(
      'data-theme',
      prefersDark ? 'dark' : 'light'
    )
  }, [])

  return <>{children}</>
}
