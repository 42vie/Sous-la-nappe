'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { CharacterId } from '@/lib/types/characters'

const CHARACTERS: {
  id: CharacterId
  name: string
  tagline: string
  role: string
  tag: string
  color: string
}[] = [
  {
    id: 'maelys',
    name: 'Maëlys Renaud',
    tagline: 'Elle a tout préparé.',
    role: 'Hôtesse',
    tag: 'POV LE PLUS INFORMÉ',
    color: 'var(--color-error)',
  },
  {
    id: 'noe',
    name: 'Noé Varnier',
    tagline: 'Il n’aurait pas dû venir.',
    role: 'Ex-associé',
    tag: 'CIBLE PRÉVUE',
    color: 'var(--color-warning)',
  },
  {
    id: 'ines',
    name: 'Inès Varnier',
    tagline: 'Elle voit ce que les autres ne voient pas.',
    role: 'Sœur de Noé',
    tag: 'CIBLE PRÉVUE',
    color: 'var(--color-warning)',
  },
  {
    id: 'lucas',
    name: 'Lucas Berthier',
    tagline: 'Il sait. Il n’a rien dit.',
    role: 'Témoin canonique',
    tag: 'TÉMOIN',
    color: 'var(--color-blue)',
  },
  {
    id: 'sarah',
    name: 'Sarah Kessler',
    tagline: 'Elle ne se souvient de rien après 22h.',
    role: 'Victime canonique',
    tag: 'VICTIME',
    color: 'var(--color-success)',
  },
  {
    id: 'yanis',
    name: 'Yanis Amrani',
    tagline: 'Il a pris la photo. Il ne savait pas.',
    role: 'Témoin accidentel',
    tag: 'TÉMOIN ACCIDENTEL',
    color: 'var(--color-primary)',
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
      const res = await fetch('/api/run/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character: selected }),
      })
      if (!res.ok) {
        const data = await res.json()
        if (res.status === 401) {
          router.push('/login')
          return
        }
        throw new Error(data.error ?? 'Erreur')
      }
      const { runId } = await res.json()
      router.push(`/run/${runId}`)
    } catch (err: unknown) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: 'var(--content-default)', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>

      {/* Grille de personnages */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(260px, 100%), 1fr))',
        gap: 'var(--space-4)',
      }}>
        {CHARACTERS.map((c) => {
          const isSelected = selected === c.id
          return (
            <button
              key={c.id}
              onClick={() => setSelected(c.id)}
              style={{
                textAlign: 'left',
                padding: 'var(--space-5)',
                background: isSelected ? 'var(--color-surface-offset)' : 'var(--color-surface)',
                border: `1px solid ${isSelected ? c.color : 'var(--color-border)'}`,
                borderRadius: 'var(--radius-lg)',
                cursor: 'pointer',
                transition: 'all var(--transition)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
              }}
            >
              {/* Tag */}
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: c.color,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                fontWeight: 500,
              }}>
                {c.tag}
              </span>

              {/* Nom */}
              <p style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'var(--text-lg)',
                color: 'var(--color-text)',
                fontStyle: 'italic',
                lineHeight: 1.2,
              }}>
                {c.name}
              </p>

              {/* Rôle */}
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-text-faint)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}>
                {c.role}
              </p>

              {/* Tagline */}
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text-muted)',
                lineHeight: 1.6,
                borderTop: '1px solid var(--color-divider)',
                paddingTop: 'var(--space-3)',
                marginTop: 'var(--space-1)',
              }}>
                {c.tagline}
              </p>
            </button>
          )
        })}
      </div>

      {/* Bouton lancer */}
      {selected && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 'var(--space-3)' }}>
          {error && (
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-error)',
            }}>
              {error}
            </p>
          )}
          <button
            onClick={handleStart}
            disabled={loading}
            style={{
              padding: 'var(--space-3) var(--space-10)',
              background: 'var(--color-primary)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              letterSpacing: '0.04em',
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.6 : 1,
              transition: 'all var(--transition)',
            }}
          >
            {loading ? 'Chargement…' : `Jouer en tant que ${CHARACTERS.find(c => c.id === selected)?.name}`}
          </button>
        </div>
      )}
    </div>
  )
}
