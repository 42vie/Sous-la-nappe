'use client'

import type { ClueId } from '@/lib/types/clues'
import cluesRaw from '@/data/clues.json'

interface ClueEntry { ref: string; label: string; reliability: string; misleads: string }

// Avant : une copie manuelle partielle (10 des 25 indices canoniques
// manquaient — ils ne s'affichaient jamais une fois découverts). On lit
// directement data/clues.json, la même source que le reste du moteur, pour
// ne plus jamais désynchroniser les deux.
const CLUES_DATA: Record<string, ClueEntry> = Object.fromEntries(
  (cluesRaw as ClueEntry[]).map((c) => [c.ref, c])
)

const RELIABILITY_COLORS: Record<string, string> = {
  faible: 'var(--color-text-faint)',
  moyenne: 'var(--color-warning)',
  haute: 'var(--color-success)',
  tres_haute: 'var(--color-primary)',
}

interface CluePanelProps {
  discoveredClues: string[]
}

export function CluePanel({ discoveredClues }: CluePanelProps) {
  if (discoveredClues.length === 0) {
    return (
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-faint)',
        fontStyle: 'italic',
        padding: 'var(--space-4)',
      }}>
        Aucun indice découvert pour l'instant.
      </p>
    )
  }

  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {discoveredClues.map((ref) => {
        const clue = CLUES_DATA[ref]
        if (!clue) return null
        const color = RELIABILITY_COLORS[clue.reliability] ?? 'var(--color-text-muted)'
        return (
          <li
            key={ref}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              borderLeft: `3px solid ${color}`,
            }}
          >
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text)',
              marginBottom: 'var(--space-1)',
            }}>
              <span style={{ color, fontWeight: 500 }}>{ref}</span>{' — '}{clue.label}
            </p>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-faint)',
              fontStyle: 'italic',
            }}>
              Première impression : {clue.misleads}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
