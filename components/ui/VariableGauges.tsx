'use client'

// Panneau des tensions internes — jauges de tous les personnages, en direct.
// Le choix courant (quel que soit le POV joué) peut faire bouger les
// variables des AUTRES personnages : ce panneau rend ça visible.
import type { CharacterId, CharacterState } from '@/lib/types/characters'

const CHARACTER_COLORS: Record<CharacterId, string> = {
  maelys: '#8b1a1a',
  noe:    '#4a5568',
  ines:   '#744210',
  lucas:  '#2d6b2d',
  sarah:  '#5a3a7e',
  yanis:  '#1a4a7a',
}

const CHARACTER_NAMES: Record<CharacterId, string> = {
  maelys: 'Maëlys',
  noe:    'Noé',
  ines:   'Inès',
  lucas:  'Lucas',
  sarah:  'Sarah',
  yanis:  'Yanis',
}

interface Gauge {
  key: keyof CharacterState
  label: string
}

const GAUGES_BY_CHARACTER: Record<CharacterId, Gauge[]> = {
  maelys: [
    { key: 'maelysColere', label: 'Colère' },
    { key: 'maelysControle', label: 'Contrôle' },
    { key: 'maelysPanic', label: 'Panique' },
  ],
  noe: [
    { key: 'noeMensonge', label: 'Mensonge' },
    { key: 'noeLachete', label: 'Lâcheté' },
    { key: 'noeInfluenceMaelys', label: 'Influence sur Maëlys' },
  ],
  ines: [
    { key: 'inesArrogance', label: 'Arrogance' },
    { key: 'inesIrritabilite', label: 'Irritabilité' },
    { key: 'inesTensionSociale', label: 'Tension sociale' },
  ],
  lucas: [
    { key: 'lucasLucidite', label: 'Lucidité' },
    { key: 'lucasCourage', label: 'Courage' },
    { key: 'lucasNeutralite', label: 'Neutralité' },
  ],
  sarah: [
    { key: 'sarahStabilite', label: 'Stabilité' },
    { key: 'sarahMemoire', label: 'Mémoire' },
    { key: 'sarahDependanceMaelys', label: 'Dépendance à Maëlys' },
  ],
  yanis: [
    { key: 'yanisJeuSocial', label: 'Jeu social' },
    { key: 'yanisInsouciance', label: 'Insouciance' },
  ],
}

const ALL_CHARACTERS: CharacterId[] = ['maelys', 'noe', 'ines', 'lucas', 'sarah', 'yanis']

function Bar({ value, color }: { value: number; color: string }) {
  const clamped = Math.max(0, Math.min(100, value))
  return (
    <div style={{
      width: '100%',
      height: 5,
      borderRadius: 3,
      background: 'var(--color-surface-offset)',
      overflow: 'hidden',
    }}>
      <div style={{
        width: `${clamped}%`,
        height: '100%',
        background: color,
        transition: 'width 400ms ease',
      }} />
    </div>
  )
}

interface VariableGaugesProps {
  characterState: CharacterState
  currentPov?: CharacterId
}

export function VariableGauges({ characterState, currentPov }: VariableGaugesProps) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: 'var(--space-4)',
    }}>
      {ALL_CHARACTERS.map((charId) => {
        const gauges = GAUGES_BY_CHARACTER[charId]
        const color = CHARACTER_COLORS[charId]
        const isCurrent = charId === currentPov
        return (
          <div
            key={charId}
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${isCurrent ? color : 'var(--color-border)'}`,
              background: isCurrent ? `${color}0d` : 'transparent',
            }}
          >
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 'var(--space-2)',
              fontWeight: 600,
            }}>
              {CHARACTER_NAMES[charId]}{isCurrent ? ' (vous)' : ''}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {gauges.map((g) => {
                const raw = characterState[g.key]
                const value = typeof raw === 'number' ? raw : 0
                return (
                  <div key={String(g.key)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-faint)' }}>
                        {g.label}
                      </span>
                      <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-faint)' }}>
                        {value}
                      </span>
                    </div>
                    <Bar value={value} color={color} />
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
