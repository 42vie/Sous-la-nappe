'use client'

// Composant persistant — Plan de table
// Affiche l'historique des 4 états de placement

import type { CharacterId, RunState } from '@/types'

const SEAT_LABELS: Record<number, string> = {
  1: '[1]',
  2: '[2]',
  3: '[3]',
  4: '[4]',
  5: '[5]',
  6: '[6]',
}

const CHARACTER_COLORS: Record<CharacterId, string> = {
  maelys: '#8b1a1a',
  noe:    '#4a5568',
  ines:   '#744210',
  lucas:  '#2d6b2d',
  sarah:  '#5a3a7e',
  yanis:  '#1a4a7a',
}

interface SeatingPlanProps {
  state: Partial<RunState>
  showHistory?: boolean
}

export function SeatingPlan({ state, showHistory = false }: SeatingPlanProps) {
  const current = state.seatingAtCritical ?? state.seatingBeforeMain ?? state.seatingPlanned

  if (!current) return null

  return (
    <div
      style={{
        fontFamily: 'var(--font-body)',
        fontSize:   'var(--text-xs)',
        background: 'var(--color-surface)',
        border:     '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding:    'var(--space-4)',
      }}
    >
      <p style={{ color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Plan de table
      </p>

      {/* Passe */}
      <div style={{ textAlign: 'center', color: 'var(--color-text-faint)', marginBottom: 'var(--space-2)' }}>
        ~~~ LE PASSE ~~~
      </div>

      {/* Grille 2 colonnes 3 rangées */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-1)' }}>
        {[1, 2, 3, 4, 5, 6].map((seat) => {
          const charId = current[seat as keyof typeof current] as CharacterId | undefined
          return (
            <div
              key={seat}
              style={{
                padding: 'var(--space-2)',
                background: 'var(--color-surface-offset)',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                gap: 'var(--space-2)',
                alignItems: 'center',
              }}
            >
              <span style={{ color: 'var(--color-text-faint)' }}>{SEAT_LABELS[seat]}</span>
              {charId && (
                <span style={{ color: CHARACTER_COLORS[charId] ?? 'var(--color-text)', fontWeight: 500 }}>
                  {charId.charAt(0).toUpperCase() + charId.slice(1)}
                </span>
              )}
            </div>
          )
        })}
      </div>

      {showHistory && (
        <p style={{ color: 'var(--color-text-faint)', marginTop: 'var(--space-3)', fontSize: 'var(--text-xs)' }}>
          Historique : planned → before_main → at_critical → after_incident
        </p>
      )}
    </div>
  )
}
