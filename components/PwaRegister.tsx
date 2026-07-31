'use client'

import { useEffect } from 'react'

/** Enregistre le service worker PWA — silencieux si non supporté. */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('[PWA] échec d\'enregistrement du service worker', err)
    })
  }, [])

  return null
}
