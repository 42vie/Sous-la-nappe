'use client'

/**
 * DosageMinigame — Scène 8 : le service critique.
 * Sarah sort les quatre premières assiettes du passe, dans l'ordre — 1, 2, 3, 4 —
 * et les pose aux places 1 à 4. Le joueur rejoue ce geste : sortir les
 * assiettes dans le bon ordre. Un service maîtrisé apaise légèrement la
 * tension ; un service confus l'alimente — la mécanique qui décide qui est
 * réellement visé (targetActual) reste gérée ailleurs (lib/engine/deviation.ts),
 * ce mini-jeu ne fait que rejouer, en le rendant concret, ce que le texte
 * de la scène décrit déjà.
 */

import { useState, useMemo } from 'react'
import type { CharacterId } from '@/lib/types/characters'

const LABELS: Record<CharacterId, string> = {
  maelys: 'Maëlys', noe: 'Noé', ines: 'Inès', lucas: 'Lucas', sarah: 'Sarah', yanis: 'Yanis',
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

interface DosageMinigameProps {
  /** Qui occupe les sièges 1 à 4 au moment du service — pour ancrer le geste dans l'état réel du run */
  seatingBeforeMain?: Partial<Record<number, CharacterId | null>>
  onComplete: (result: { orderedCorrectly: boolean; mistakes: number }) => void
}

const FALLBACK_SEATING: Record<number, CharacterId> = {
  1: 'maelys', 2: 'noe', 3: 'ines', 4: 'lucas',
}

export function DosageMinigame({ seatingBeforeMain, onComplete }: DosageMinigameProps) {
  const seating = { ...FALLBACK_SEATING, ...seatingBeforeMain }
  const plateOrder = useMemo(() => shuffle([1, 2, 3, 4]), [])

  const [delivered, setDelivered] = useState<number[]>([])
  const [mistakes, setMistakes] = useState(0)
  const [sent, setSent] = useState(false)

  const nextExpected = delivered.length + 1
  const done = delivered.length === 4

  function handlePlateClick(plateNumber: number) {
    if (done || delivered.includes(plateNumber)) return
    if (plateNumber === nextExpected) {
      setDelivered((prev) => [...prev, plateNumber])
    } else {
      setMistakes((prev) => prev + 1)
    }
  }

  function handleConfirm() {
    if (sent) return
    setSent(true)
    onComplete({ orderedCorrectly: mistakes === 0, mistakes })
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: 440,
      margin: '0 auto',
      padding: 'var(--space-6)',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
    }}>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)',
        textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginBottom: 'var(--space-2)',
      }}>
        Mini-jeu — Le service
      </p>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)',
        textAlign: 'center', marginBottom: 'var(--space-6)', fontStyle: 'italic',
      }}>
        Sortez les assiettes du passe dans l&apos;ordre — 1, 2, 3, 4.
      </p>

      {/* Passe — plaques à cliquer dans l'ordre */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)',
        marginBottom: 'var(--space-6)',
      }}>
        {plateOrder.map((n) => {
          const isDelivered = delivered.includes(n)
          return (
            <button
              key={n}
              onClick={() => handlePlateClick(n)}
              disabled={isDelivered || done}
              style={{
                height: 56,
                background: isDelivered ? 'var(--color-surface-offset)' : 'var(--color-primary-highlight)',
                border: `1px solid ${isDelivered ? 'var(--color-divider)' : 'var(--color-primary)'}`,
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)',
                color: isDelivered ? 'var(--color-text-faint)' : 'var(--color-primary)',
                opacity: isDelivered ? 0.4 : 1,
                cursor: isDelivered || done ? 'default' : 'pointer',
                transition: 'all var(--transition)',
              }}
            >
              {isDelivered ? '✓' : `Assiette ${n}`}
            </button>
          )
        })}
      </div>

      {/* Table — positions 1 à 4, se remplissent au fur et à mesure */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-2)',
        marginBottom: 'var(--space-5)',
      }}>
        {[1, 2, 3, 4].map((seat) => {
          const served = delivered.includes(seat)
          const char = seating[seat]
          return (
            <div key={seat} style={{
              padding: 'var(--space-2) var(--space-1)',
              textAlign: 'center',
              background: served ? 'var(--color-surface-offset)' : 'transparent',
              border: '1px dashed var(--color-divider)',
              borderRadius: 'var(--radius-md)',
            }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--color-text-faint)', marginBottom: '2px' }}>
                Place {seat}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: served ? 'var(--color-text)' : 'var(--color-text-faint)' }}>
                {char ? LABELS[char] : '—'}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px' }}>{served ? '🍽' : ''}</p>
            </div>
          )
        })}
      </div>

      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
        color: done ? 'var(--color-text)' : 'var(--color-text-faint)',
        textAlign: 'center', marginBottom: 'var(--space-4)', minHeight: '1.5em',
      }}>
        {done
          ? mistakes === 0
            ? 'Service fluide, aucune hésitation.'
            : `Service un peu confus — ${mistakes} assiette${mistakes > 1 ? 's' : ''} sortie${mistakes > 1 ? 's' : ''} dans le désordre.`
          : `Prochaine assiette à sortir : ${nextExpected}`}
      </p>

      {done && (
        <button
          onClick={handleConfirm}
          disabled={sent}
          style={{
            width: '100%', padding: 'var(--space-3) var(--space-6)',
            background: 'var(--color-primary)', color: 'var(--color-text-inverse)',
            border: 'none', borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', letterSpacing: '0.04em',
            cursor: sent ? 'wait' : 'pointer', opacity: sent ? 0.7 : 1,
          }}
        >
          Continuer →
        </button>
      )}
    </div>
  )
}
