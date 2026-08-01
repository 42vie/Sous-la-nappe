'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CharacterCard, CHARACTERS } from '@/components/ui/CharacterCard'
import { getCharacterAction, formatCharacterAction } from '@/lib/engine/characterActions'
import type { CharacterId } from '@/lib/types/characters'

/**
 * Page dédiée à la sélection de personnage pour une nouvelle partie —
 * avant, c'était une grille révélée en bas de /dashboard, qu'il fallait
 * scroller pour atteindre. Une page à part rend le choix immédiat, sans
 * scroll, et garde le dashboard concentré sur "reprendre / voir le carnet".
 */
export default function NouvellePartiePage() {
  const router = useRouter()
  const [selected, setSelected] = useState<CharacterId | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedChar = CHARACTERS.find((c) => c.id === selected)

  async function handleStart() {
    if (!selected || loading) return
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
        if (res.status === 401) { router.push('/login?next=/dashboard'); return }
        throw new Error(data.error ?? 'Erreur serveur')
      }
      const { runId } = await res.json()
      router.push(`/run/${runId}`)
    } catch (err: unknown) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'var(--space-10) var(--space-8) var(--space-24)',
      }}
    >
      <header style={{ width: '100%', maxWidth: 'var(--content-wide)', marginBottom: 'var(--space-8)' }}>
        <Link
          href="/dashboard"
          style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)',
            textTransform: 'uppercase', letterSpacing: '0.1em', textDecoration: 'none', display: 'inline-block',
            marginBottom: 'var(--space-6)',
          }}
        >
          ← Retour
        </Link>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text)',
          fontWeight: 400, fontStyle: 'italic', marginBottom: 'var(--space-2)',
        }}>
          Choisir un point de vue
        </h1>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)' }}>
          Chacun voit une partie différente de la soirée.
        </p>
      </header>

      <div
        style={{
          width: '100%',
          maxWidth: 'var(--content-wide)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))',
          gap: 'var(--space-4)',
          marginBottom: 'var(--space-12)',
        }}
      >
        {CHARACTERS.map((c) => (
          <CharacterCard
            key={c.id}
            character={c}
            isSelected={selected === c.id}
            onClick={() => setSelected((prev) => (prev === c.id ? null : c.id))}
            accrocheOverride={formatCharacterAction(getCharacterAction(c.id, 1, 0))}
          />
        ))}
      </div>

      {/* Bandeau bas fixe — apparaît quand un perso est sélectionné */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 'var(--space-4) var(--space-8)',
          background: 'var(--color-surface)',
          borderTop: '1px solid var(--color-divider)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 'var(--space-4)',
          transform: selected ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1)',
          zIndex: 10,
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
          {selectedChar && (
            <>
              <p style={{
                fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)',
                color: selectedChar.color, fontStyle: 'italic', lineHeight: 1,
              }}>
                {selectedChar.firstName}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)' }}>
                {formatCharacterAction(getCharacterAction(selectedChar.id, 1, 0))}
              </p>
            </>
          )}
          {error && (
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>
              {error}
            </p>
          )}
        </div>

        <button
          onClick={handleStart}
          disabled={loading || !selected}
          style={{
            flexShrink: 0,
            padding: 'var(--space-3) var(--space-8)',
            background: selectedChar ? selectedChar.color : 'var(--color-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            letterSpacing: '0.04em',
            cursor: loading ? 'wait' : 'pointer',
            opacity: loading ? 0.7 : 1,
            transition: 'all var(--transition)',
          }}
        >
          {loading ? 'Chargement…' : '🎭 Jouer ce rôle →'}
        </button>
      </div>
    </main>
  )
}
