'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CharacterId } from '@/lib/types/characters'

const CHARACTERS: {
  id: CharacterId
  name: string
  age: number
  role: string
  tagline: string
}[] = [
  {
    id: 'maelys',
    name: 'Maëlys Renaud',
    age: 30,
    role: "L'hôte",
    tagline: 'pivot · pov le plus informé · pov le plus aveugle',
  },
  {
    id: 'noe',
    name: 'Noé Varnier',
    age: 32,
    role: 'Le déclencheur',
    tagline: 'cible pensée n°1 · architecte du faux récit',
  },
  {
    id: 'ines',
    name: 'Inès Varnier',
    age: 26,
    role: "L'accélérateur",
    tagline: 'cible pensée n°2 · victime probable',
  },
  {
    id: 'lucas',
    name: 'Lucas Berthier',
    age: 33,
    role: 'Le témoin qui pouvait empêcher',
    tagline: 'témoin canonique · détenteur du vocal',
  },
  {
    id: 'sarah',
    name: 'Sarah Kessler',
    age: 30,
    role: "La vérité que personne ne croira",
    tagline: 'victime canonique · témoin sensoriel',
  },
  {
    id: 'yanis',
    name: 'Yanis Amrani',
    age: 27,
    role: 'Le perturbateur innocent',
    tagline: 'agent du placement fatal · témoin accidentel',
  },
]

export function CharacterSelector() {
  const router = useRouter()
  const [selected, setSelected] = useState<CharacterId | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleStart() {
    if (!selected) return
    setLoading(true)
    setError(null)

    try {
      // playerId temporaire (anon) — à remplacer par Firebase Auth uid
      const playerId = crypto.randomUUID()

      const res = await fetch('/api/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, playerCharacter: selected }),
      })

      if (!res.ok) throw new Error('Erreur lors de la création du run')

      const { runId } = await res.json()
      router.push(`/run/${runId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 'var(--content-default)' }}>
      {/* Grille des personnages */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-8)',
        }}
      >
        {CHARACTERS.map((c) => {
          const isSelected = selected === c.id
          return (
            <button
              key={c.id}
              onClick={() => setSelected(isSelected ? null : c.id)}
              aria-pressed={isSelected}
              style={{
                textAlign: 'left',
                padding: 'var(--space-6)',
                background: isSelected
                  ? 'var(--color-primary-highlight)'
                  : 'var(--color-surface)',
                border: `1px solid ${
                  isSelected ? 'var(--color-primary)' : 'var(--color-border)'
                }`,
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                transition: 'all var(--transition)',
                boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
              }}
            >
              {/* Rôle */}
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  color: isSelected
                    ? 'var(--color-primary)'
                    : 'var(--color-text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 'var(--space-2)',
                }}
              >
                {c.role}
              </p>

              {/* Nom + âge */}
              <p
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'var(--text-lg)',
                  fontWeight: 500,
                  color: 'var(--color-text)',
                  marginBottom: 'var(--space-1)',
                  lineHeight: 1.2,
                }}
              >
                {c.name}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-faint)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                {c.age} ans
              </p>

              {/* Tagline */}
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  color: isSelected
                    ? 'var(--color-primary)'
                    : 'var(--color-text-faint)',
                  lineHeight: 1.5,
                  fontStyle: 'italic',
                }}
              >
                {c.tagline}
              </p>
            </button>
          )
        })}
      </div>

      {/* CTA */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
        <button
          onClick={handleStart}
          disabled={!selected || loading}
          style={{
            padding: 'var(--space-3) var(--space-8)',
            background:
              selected && !loading
                ? 'var(--color-primary)'
                : 'var(--color-surface-offset)',
            color:
              selected && !loading
                ? 'var(--color-text-inverse)'
                : 'var(--color-text-faint)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            letterSpacing: '0.04em',
            cursor: selected && !loading ? 'pointer' : 'not-allowed',
            transition: 'all var(--transition)',
            boxShadow: selected && !loading ? 'var(--shadow-md)' : 'none',
          }}
        >
          {loading ? 'Chargement…' : selected ? `Jouer avec ${CHARACTERS.find(c => c.id === selected)?.name}` : 'Choisissez un personnage'}
        </button>

        {error && (
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-error)',
            }}
          >
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
