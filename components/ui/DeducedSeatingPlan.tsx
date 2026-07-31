'use client'

// Plan de table déduit — écran d'accueil. Contrairement à SeatingPlan.tsx
// (l'état réel de la partie en cours pendant le jeu), celui-ci montre ce
// que le joueur peut reconstituer : places confirmées (personnage déjà
// incarné) vs places supposées (floutées, pas garanties). Cliquer sur un
// personnage révèle un indice sur sa fiabilité.
import { useState } from 'react'
import type { CharacterId } from '@/lib/types/characters'
import type { DeducedCharacterSeat } from '@/lib/engine/deducedSeating'

const CHARACTER_COLORS: Record<CharacterId, string> = {
  maelys: '#8b1a1a', noe: '#4a5568', ines: '#744210',
  lucas: '#2d6b2d', sarah: '#5a3a7e', yanis: '#1a4a7a',
}
const CHARACTER_INITIALS: Record<CharacterId, string> = {
  maelys: 'M', noe: 'N', ines: 'I', lucas: 'L', sarah: 'S', yanis: 'Y',
}
const LABELS: Record<CharacterId, string> = {
  maelys: 'Maëlys', noe: 'Noé', ines: 'Inès', lucas: 'Lucas', sarah: 'Sarah', yanis: 'Yanis',
}

interface DeducedSeatingPlanProps {
  seats: DeducedCharacterSeat[]
}

export function DeducedSeatingPlan({ seats }: DeducedSeatingPlanProps) {
  const [openHint, setOpenHint] = useState<CharacterId | null>(null)

  const bySeat = new Map<number, DeducedCharacterSeat>()
  const unplaced: DeducedCharacterSeat[] = []
  for (const s of seats) {
    if (s.seat) bySeat.set(s.seat, s)
    else unplaced.push(s)
  }

  const active = seats.find((s) => s.character === openHint) ?? null

  return (
    <div>
      <div style={{
        textAlign: 'center', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
        color: 'var(--color-text-faint)', letterSpacing: '0.12em', marginBottom: 'var(--space-3)',
      }}>
        ~~~ PASSE ~~~
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)', marginBottom: unplaced.length ? 'var(--space-3)' : 0 }}>
        {[1, 2, 3, 4, 5, 6].map((seatNum) => {
          const entry = bySeat.get(seatNum)
          return (
            <button
              key={seatNum}
              onClick={() => entry && setOpenHint((prev) => (prev === entry.character ? null : entry.character))}
              disabled={!entry}
              style={{
                padding: 'var(--space-2) var(--space-1)',
                background: 'var(--color-surface-offset)',
                border: `1px solid ${entry?.confirmed ? 'var(--color-primary)' : 'var(--color-divider)'}`,
                borderRadius: 'var(--radius-sm)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                cursor: entry ? 'pointer' : 'default',
              }}
            >
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--color-text-faint)' }}>
                [{seatNum}]
              </span>
              {entry ? (
                <span
                  title={LABELS[entry.character]}
                  style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                    width: 24, height: 24, borderRadius: '50%',
                    background: CHARACTER_COLORS[entry.character],
                    color: '#fff', fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-body)',
                    filter: entry.confirmed ? 'none' : 'blur(1.5px)',
                    opacity: entry.confirmed ? 1 : 0.55,
                  }}
                >
                  {CHARACTER_INITIALS[entry.character]}
                </span>
              ) : (
                <span style={{ width: 24, height: 24 }} />
              )}
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: '9px',
                color: entry?.confirmed ? 'var(--color-text-muted)' : 'var(--color-text-faint)',
                fontStyle: entry?.confirmed ? 'normal' : 'italic',
              }}>
                {entry ? (entry.confirmed ? LABELS[entry.character] : '?') : '—'}
              </span>
            </button>
          )
        })}
      </div>

      {unplaced.length > 0 && (
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', fontStyle: 'italic', marginBottom: 'var(--space-3)' }}>
          Position inconnue : {unplaced.map((s) => LABELS[s.character]).join(', ')}
        </p>
      )}

      {active && (
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-divider)',
          borderRadius: 'var(--radius-md)',
        }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)', fontStyle: 'italic', lineHeight: 1.6 }}>
            {active.hint}
          </p>
        </div>
      )}
    </div>
  )
}
