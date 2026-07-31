'use client'

import { useEffect, useState } from 'react'
import { useParams, notFound } from 'next/navigation'
import { SceneEngine } from '@/components/ui/SceneEngine'
import type { CharacterId } from '@/lib/types/characters'

interface RunData {
  id: string
  playerCharacter: CharacterId
  currentScene: number
  discoveredClues: string[]
  flags: Record<string, boolean | number | string>
}

export default function RunPage() {
  const params = useParams()
  const runId = params.runId as string

  const [run, setRun] = useState<RunData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!runId) return
    fetch(`/api/run/${runId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Run introuvable')
        const data = await res.json()
        setRun(data)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [runId])

  if (loading) {
    return (
      <main style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-faint)',
          fontStyle: 'italic',
        }}>
          Chargement…
        </p>
      </main>
    )
  }

  if (error || !run) {
    return (
      <main style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-error)',
        }}>
          {error ?? 'Run introuvable.'}
        </p>
      </main>
    )
  }

  const CHARACTER_NAMES: Record<CharacterId, string> = {
    maelys: 'Maëlys Renaud',
    noe: 'Noé Varnier',
    ines: 'Inès Varnier',
    lucas: 'Lucas Berthier',
    sarah: 'Sarah Kessler',
    yanis: 'Yanis Amrani',
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'var(--space-12) var(--space-8)',
      }}
    >
      {/* En-tête du run */}
      <header style={{
        width: '100%',
        maxWidth: 'var(--content-narrow)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 'var(--space-12)',
        borderBottom: '1px solid var(--color-divider)',
        paddingBottom: 'var(--space-4)',
      }}>
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-lg)',
          color: 'var(--color-text)',
          fontStyle: 'italic',
        }}>
          Sous la nappe
        </p>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          {CHARACTER_NAMES[run.playerCharacter]}
        </p>
      </header>

      {/* Moteur de scènes */}
      <SceneEngine
        runId={run.id}
        playerPov={run.playerCharacter}
        initialScene={run.currentScene ?? 1}
        discoveredClues={run.discoveredClues ?? []}
      />
    </main>
  )
}
