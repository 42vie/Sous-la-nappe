'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { SceneEngine } from '@/components/ui/SceneEngine'
import { useRunStore } from '@/store/runStore'
import type { CharacterId } from '@/lib/types/characters'
import type { RunState } from '@/types'

const CHARACTER_NAMES: Record<CharacterId, string> = {
  maelys: 'Maëlys Renaud',
  noe:    'Noé Varnier',
  ines:   'Inès Varnier',
  lucas:  'Lucas Berthier',
  sarah:  'Sarah Kessler',
  yanis:  'Yanis Amrani',
}

export default function RunPage() {
  const params = useParams()
  const runId = params.runId as string

  const { run, isLoading, error, setRun } = useRunStore()

  useEffect(() => {
    if (!runId) return
    // Si le run est déjà en store et correspond, pas de refetch
    if (run?.runId === runId) return

    fetch(`/api/run/${runId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Run introuvable')
        const data: RunState = await res.json()
        setRun(data)
      })
      .catch((err) => {
        console.error('[RunPage] fetch run:', err)
      })
  }, [runId, run, setRun])

  if (isLoading || !run) {
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
          {isLoading ? 'Chargement…' : 'Initialisation du run…'}
        </p>
      </main>
    )
  }

  if (error) {
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
          {error}
        </p>
      </main>
    )
  }

  const pov = run.playerPov ?? run.playerCharacter

  return (
    <main style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 'var(--space-12) var(--space-8)',
    }}>
      {/* En-tête */}
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
          {CHARACTER_NAMES[pov] ?? pov}
        </p>
      </header>

      {/* Moteur de scènes — branché sur l'API S2 */}
      <SceneEngine
        runId={runId}
        playerPov={pov}
        initialSceneId={String(run.currentScene)}
        run={run}
      />
    </main>
  )
}
