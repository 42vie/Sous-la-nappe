'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { SceneEngine } from '@/components/ui/SceneEngine'
import { useRunStore } from '@/store/runStore'
import { getChapterNumberForScene } from '@/lib/engine/chapters'
import type { CharacterId } from '@/lib/types/characters'
import type { RunState } from '@/lib/types/engine'

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
  const router = useRouter()
  const runId = params.runId as string

  const { run, isLoading, error, setRun } = useRunStore()

  useEffect(() => {
    if (!runId) return
    if (run?.runId === runId) return

    fetch(`/api/run/${runId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Run introuvable')
        const data = await res.json() as RunState
        setRun(data)
      })
      .catch((err) => {
        console.error('[RunPage] fetch run:', err)
      })
  }, [runId, run, setRun])

  // Run déjà terminé (ex. on revient sur /run/[id] après coup, ou un second
  // advance() a été tenté après la fin) → l'écran final, jamais une erreur.
  useEffect(() => {
    if (run?.isComplete) {
      router.replace(`/run/${runId}/final`)
    }
  }, [run, runId, router])

  // Frontière de chapitre : la scène courante appartient à un chapitre pour
  // lequel aucun personnage n'a encore été choisi → passer par l'écran de
  // sélection avant d'afficher quoi que ce soit.
  useEffect(() => {
    if (!run || run.isComplete) return
    const povHistory = run.povHistory ?? [run.playerPov]
    const chapterNumber = getChapterNumberForScene(run.currentScene)
    if (chapterNumber !== null && chapterNumber > povHistory.length) {
      router.replace(`/run/${runId}/chapter`)
    }
  }, [run, runId, router])

  const needsChapterChoice = run && !run.isComplete
    ? (() => {
        const chapterNumber = getChapterNumberForScene(run.currentScene)
        const povHistory = run.povHistory ?? [run.playerPov]
        return chapterNumber !== null && chapterNumber > povHistory.length
      })()
    : false

  if (isLoading || !run || run.isComplete || needsChapterChoice) {
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

  // Une erreur transitoire (ex. un advance() raté) ne doit pas bloquer
  // définitivement la page si on a déjà un run utilisable en mémoire.
  if (error && !run) {
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

  const pov = run.playerPov

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

      {/* Moteur de scènes */}
      <SceneEngine
        runId={runId}
        playerPov={pov}
        initialSceneId={String(run.currentScene)}
        run={run}
      />
    </main>
  )
}
