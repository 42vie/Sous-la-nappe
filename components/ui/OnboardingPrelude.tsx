'use client'

// Onboarding narratif — jamais un écran "Bienvenue, voici les règles",
// toujours une histoire qui explique les mécaniques en passant (voir
// data/onboarding.json et docs/ux-ergonomie-chapitres-v1.md). Deux modes :
// 'first' = séquence complète à la toute première visite (préambule +
// sélection de personnage + carnet diégétique), 'help' = juste les pages du
// carnet, rouvrables à tout moment depuis le dashboard.
import { useState } from 'react'
import onboarding from '@/data/onboarding.json'

const STORAGE_KEY = 'sln_firstPlay'

export function hasCompletedOnboarding(): boolean {
  if (typeof window === 'undefined') return true
  return window.localStorage.getItem(STORAGE_KEY) !== null
}

interface Screen {
  title?: string
  text: string
  cta: string
}

function buildScreens(mode: 'first' | 'help'): Screen[] {
  const notebookScreens: Screen[] = onboarding.firstSceneIntro.notebookEntry.pages.map((p) => ({
    title: p.title,
    text: p.content,
    cta: 'Suivant',
  }))

  if (mode === 'help') return notebookScreens

  const preludeScreens: Screen[] = onboarding.prelude.screens.map((s) => ({
    text: s.text,
    cta: s.cta,
  }))
  const characterScreen: Screen = {
    title: onboarding.characterSelection.title,
    text: onboarding.characterSelection.text,
    cta: onboarding.characterSelection.cta,
  }
  return [...preludeScreens, characterScreen, ...notebookScreens]
}

interface OnboardingPreludeProps {
  mode: 'first' | 'help'
  onClose: () => void
}

export function OnboardingPrelude({ mode, onClose }: OnboardingPreludeProps) {
  const [screens] = useState(() => buildScreens(mode))
  const [index, setIndex] = useState(0)

  const screen = screens[index]
  const isLast = index === screens.length - 1

  function handleNext() {
    if (isLast) {
      if (mode === 'first') window.localStorage.setItem(STORAGE_KEY, 'done')
      onClose()
      return
    }
    setIndex((i) => i + 1)
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 200,
      background: 'var(--color-bg, #0c0a09)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-8)',
    }}>
      {mode === 'help' && (
        <button
          onClick={onClose}
          aria-label="Fermer"
          style={{
            position: 'absolute',
            top: 'var(--space-6)',
            right: 'var(--space-6)',
            background: 'none',
            border: 'none',
            color: 'var(--color-text-faint)',
            fontSize: 'var(--text-lg)',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      )}

      <div style={{ width: '100%', maxWidth: '52ch', textAlign: 'center' }}>
        {screen.title && (
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-faint)',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            marginBottom: 'var(--space-5)',
          }}>
            {screen.title}
          </p>
        )}
        <p style={{
          fontFamily: 'var(--font-display)',
          fontStyle: 'italic',
          fontSize: 'var(--text-xl)',
          color: 'var(--color-text)',
          lineHeight: 1.7,
          whiteSpace: 'pre-wrap',
          marginBottom: 'var(--space-10)',
        }}>
          {screen.text}
        </p>

        <button
          onClick={handleNext}
          style={{
            padding: 'var(--space-3) var(--space-8)',
            background: 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            letterSpacing: '0.04em',
            cursor: 'pointer',
          }}
        >
          {isLast ? (mode === 'first' ? screen.cta : 'Fermer') : screen.cta} →
        </button>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '10px',
          color: 'var(--color-text-faint)',
          marginTop: 'var(--space-6)',
          letterSpacing: '0.1em',
        }}>
          {index + 1} / {screens.length}
        </p>
      </div>
    </div>
  )
}
