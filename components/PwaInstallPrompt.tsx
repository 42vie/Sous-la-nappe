'use client'

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'sln-install-prompt-dismissed'

/**
 * Invite à installer la PWA — jusqu'ici totalement silencieux : rien
 * n'indiquait au joueur que l'appli pouvait s'installer sur son écran
 * d'accueil. Le navigateur ne propose l'événement beforeinstallprompt que
 * si les critères d'installabilité sont réunis (manifest + service worker
 * + pas déjà installée) ; ce composant reste invisible tant que ce n'est
 * pas le cas, et se souvient d'un refus pour ne pas relancer à chaque
 * visite.
 */
export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(DISMISS_KEY)) return

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }
    function handleInstalled() {
      setVisible(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  function dismiss() {
    setVisible(false)
    localStorage.setItem(DISMISS_KEY, '1')
  }

  async function handleInstall() {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
    setVisible(false)
  }

  if (!visible || !deferredPrompt) return null

  return (
    <div
      role="dialog"
      aria-label="Installer l'application"
      style={{
        position: 'fixed',
        left: 'var(--space-4)',
        right: 'var(--space-4)',
        bottom: 'var(--space-4)',
        maxWidth: 440,
        margin: '0 auto',
        padding: 'var(--space-4) var(--space-5)',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-divider)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-4)',
        zIndex: 50,
      }}
    >
      <div style={{ flex: 1 }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-sm)', fontStyle: 'italic', color: 'var(--color-text)', margin: 0 }}>
          📱 Installer Sous la nappe
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '11px', color: 'var(--color-text-faint)', margin: 'var(--space-1) 0 0' }}>
          Accès direct depuis l'écran d'accueil, sans navigateur.
        </p>
      </div>
      <button
        onClick={dismiss}
        aria-label="Ignorer"
        style={{
          background: 'none', border: 'none', color: 'var(--color-text-faint)',
          fontSize: 'var(--text-sm)', cursor: 'pointer', padding: 'var(--space-1)', flexShrink: 0,
        }}
      >
        ✕
      </button>
      <button
        onClick={handleInstall}
        style={{
          padding: 'var(--space-2) var(--space-4)',
          background: 'var(--color-primary)', color: 'var(--color-text-inverse)',
          border: 'none', borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', letterSpacing: '0.04em',
          cursor: 'pointer', flexShrink: 0,
        }}
      >
        Installer
      </button>
    </div>
  )
}
