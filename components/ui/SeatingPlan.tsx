'use client'

// Composant persistant — Plan de table avec historique 4 états
import type { CharacterId } from '@/lib/types/characters'
import type { RunState } from '@/types'

const CHARACTER_COLORS: Record<CharacterId, string> = {
  maelys: '#8b1a1a',
  noe:    '#4a5568',
  ines:   '#744210',
  lucas:  '#2d6b2d',
  sarah:  '#5a3a7e',
  yanis:  '#1a4a7a',
}

const CHARACTER_INITIALS: Record<CharacterId, string> = {
  maelys: 'M',
  noe:    'N',
  ines:   'I',
  lucas:  'L',
  sarah:  'S',
  yanis:  'Y',
}

type SeatingSnapshot = Record<number, CharacterId>

interface SeatingHistory {
  seating_planned?: SeatingSnapshot
  seating_before_main?: SeatingSnapshot
  seating_at_critical?: SeatingSnapshot
  seating_after_incident?: SeatingSnapshot
}

interface SeatingPlanProps {
  state: Partial<RunState>
  showHistory?: boolean
  highlightSeat?: number
}

const HISTORY_LABELS: Record<keyof SeatingHistory, string> = {
  seating_planned:        'Prévu',
  seating_before_main:    'Avant plat principal',
  seating_at_critical:    'Au moment critique ★',
  seating_after_incident: 'Après incident',
}

const HISTORY_KEYS: (keyof SeatingHistory)[] = [
  'seating_planned',
  'seating_before_main',
  'seating_at_critical',
  'seating_after_incident',
]

function SeatingGrid({
  seating,
  label,
  highlightSeat,
  isCurrent,
}: {
  seating: SeatingSnapshot
  label: string
  highlightSeat?: number
  isCurrent?: boolean
}) {
  return (
    <div style={{
      marginBottom: 'var(--space-4)',
      opacity: isCurrent ? 1 : 0.55,
    }}>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-xs)',
        color: isCurrent ? 'var(--color-primary)' : 'var(--color-text-faint)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: 'var(--space-2)',
      }}>
        {label}
      </p>

      {/* Passe */}
      <div style={{
        textAlign: 'center',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-faint)',
        letterSpacing: '0.12em',
        marginBottom: 'var(--space-2)',
      }}>
        ~~~ PASSE ~~~
      </div>

      {/* Grille 3×2 — sièges 1-2 (proches du passe) en premier */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--space-1)',
      }}>
        {[1, 2, 3, 4, 5, 6].map((seat) => {
          const charId = seating[seat] as CharacterId | undefined
          const isHighlighted = highlightSeat === seat && isCurrent
          return (
            <div
              key={seat}
              style={{
                padding: 'var(--space-2) var(--space-1)',
                background: isHighlighted
                  ? 'var(--color-primary-highlight)'
                  : 'var(--color-surface-offset)',
                borderRadius: 'var(--radius-sm)',
                border: isHighlighted
                  ? '1px solid var(--color-primary)'
                  : '1px solid transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: '9px',
                color: 'var(--color-text-faint)',
                lineHeight: 1,
              }}>
                [{seat}]
              </span>
              {charId ? (
                <span
                  title={charId}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: CHARACTER_COLORS[charId] ?? '#999',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-body)',
                  }}
                >
                  {CHARACTER_INITIALS[charId]}
                </span>
              ) : (
                <span style={{ width: 24, height: 24 }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function SeatingPlan({ state, showHistory = false, highlightSeat }: SeatingPlanProps) {
  const history = (state.variable?.seatingHistory ?? {}) as SeatingHistory

  // Déterminer l'état courant le plus avancé disponible
  const currentKey: keyof SeatingHistory =
    history.seating_after_incident ? 'seating_after_incident'
    : history.seating_at_critical  ? 'seating_at_critical'
    : history.seating_before_main  ? 'seating_before_main'
    : 'seating_planned'

  const currentSeating = history[currentKey]

  // Fallback si pas encore de seatingHistory dans le state (début de run)
  const fallbackSeating: SeatingSnapshot = {
    1: 'maelys',
    2: 'noe',
    3: 'ines',
    4: 'lucas',
    5: 'sarah',
    6: 'yanis',
  }

  if (!currentSeating && !showHistory) {
    return (
      <SeatingGrid
        seating={fallbackSeating}
        label="Plan de table (initial)"
        isCurrent
      />
    )
  }

  if (!showHistory) {
    return (
      <div style={{
        fontFamily: 'var(--font-body)',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-4)',
      }}>
        <SeatingGrid
          seating={currentSeating ?? fallbackSeating}
          label={HISTORY_LABELS[currentKey]}
          highlightSeat={highlightSeat}
          isCurrent
        />
      </div>
    )
  }

  // Mode historique complet — 4 états
  return (
    <div style={{
      fontFamily: 'var(--font-body)',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: 'var(--space-4)',
    }}>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: 'var(--space-4)',
      }}>
        Plan de table
      </p>

      {HISTORY_KEYS.map((key) => {
        const snap = history[key]
        if (!snap) return null
        return (
          <SeatingGrid
            key={key}
            seating={snap}
            label={HISTORY_LABELS[key]}
            highlightSeat={key === 'seating_at_critical' ? highlightSeat : undefined}
            isCurrent={key === currentKey}
          />
        )
      })}

      {/* Légende */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-3)',
        marginTop: 'var(--space-4)',
        paddingTop: 'var(--space-3)',
        borderTop: '1px solid var(--color-divider)',
      }}>
        {(Object.entries(CHARACTER_COLORS) as [CharacterId, string][]).map(([charId, color]) => (
          <span
            key={charId}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
            }}
          >
            <span style={{
              display: 'inline-flex',
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: color,
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '9px',
              fontWeight: 700,
            }}>
              {CHARACTER_INITIALS[charId]}
            </span>
            {charId.charAt(0).toUpperCase() + charId.slice(1)}
          </span>
        ))}
      </div>
    </div>
  )
}
