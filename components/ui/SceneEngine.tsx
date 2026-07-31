'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useRunStore } from '@/store/runStore'
import { CluePanel } from './CluePanel'
import { SeatingPlan } from './SeatingPlan'
import { MorpionMinigame } from './MorpionMinigame'
import type { CharacterId } from '@/lib/types/characters'
import type { RunState } from '@/types'

interface SceneData {
  id: string
  index: number
  title: string
  time?: string
  narrative: string
  minigameId?: string | null
  canonicalFacts: string[]
}

interface ChoiceData {
  id: string
  verb: string
  label: string
  description?: string | null
}

interface SceneEngineProps {
  runId: string
  playerPov: CharacterId
  initialSceneId: string
  run: RunState
}

type Phase = 'loading' | 'narrative' | 'choices' | 'minigame' | 'transition' | 'done'

export function SceneEngine({ runId, playerPov, initialSceneId, run }: SceneEngineProps) {
  const router = useRouter()
  const { advance, loadCurrentScene, setFlag, run: storeRun } = useRunStore()

  const [scene, setScene] = useState<SceneData | null>(null)
  const [choices, setChoices] = useState<ChoiceData[]>([])
  const [phase, setPhase] = useState<Phase>('loading')
  const [choiceMade, setChoiceMade] = useState<ChoiceData | null>(null)
  const [cluesJustRevealed, setCluesJustRevealed] = useState<string[]>([])
  const [narrativeNotes, setNarrativeNotes] = useState<string[]>([])
  const [activeMinigame, setActiveMinigame] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showClues, setShowClues] = useState(false)
  const [showSeating, setShowSeating] = useState(false)

  const discoveredClues = storeRun?.discoveredClues ?? run.discoveredClues ?? []

  // Charger la scène courante depuis l'API moteur
  const fetchScene = useCallback(async () => {
    setPhase('loading')
    setError(null)
    try {
      const res = await fetch(`/api/run/${runId}/advance`)
      if (!res.ok) throw new Error('Impossible de charger la scène')
      const data = await res.json()
      setScene(data.scene)
      setChoices(data.choices)
      setPhase(data.scene.minigameId ? 'minigame' : 'narrative')
      // Appliquer les effets d'entrée de scène en local
      if (data.onEnterUpdates && Object.keys(data.onEnterUpdates).length > 0) {
        useRunStore.getState().updateRunLocal(data.onEnterUpdates)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setPhase('narrative')
    }
  }, [runId])

  useEffect(() => {
    fetchScene()
  }, [fetchScene])

  async function handleChoice(choice: ChoiceData) {
    setChoiceMade(choice)
    setPhase('transition')

    const result = await advance(scene!.id, choice.id)
    if (!result) {
      setError('Erreur lors de l\'avancement. Réessayez.')
      setPhase('choices')
      return
    }

    setCluesJustRevealed(result.cluesRevealed)
    setNarrativeNotes(result.narrativeInjections)

    if (result.isComplete) {
      setPhase('done')
      return
    }

    if (result.minigameToLaunch) {
      setActiveMinigame(result.minigameToLaunch)
      setPhase('minigame')
      return
    }

    setPhase('transition')
  }

  function handleNext() {
    if (phase === 'done') {
      router.push(`/run/${runId}/final`)
      return
    }
    setChoiceMade(null)
    setCluesJustRevealed([])
    setNarrativeNotes([])
    fetchScene()
  }

  function handleMinigameComplete(result: { winner: CharacterId | null; serviceHelper: CharacterId }) {
    setFlag('serviceHelper', result.serviceHelper)
    useRunStore.getState().updateRunLocal({
      variable: {
        ...((storeRun ?? run).variable),
        serviceHelper: result.serviceHelper,
      },
    })
    setActiveMinigame(null)
    setPhase('choices')
  }

  // --- Render states ---

  if (phase === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)', fontStyle: 'italic' }}>
          Chargement…
        </p>
      </div>
    )
  }

  return (
    <div style={{ width: '100%', maxWidth: 'var(--content-narrow)' }}>

      {/* ── Barre supérieure ── */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-8)',
        paddingBottom: 'var(--space-4)',
        borderBottom: '1px solid var(--color-divider)',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-faint)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          {scene ? `Scène ${scene.index} / 11${scene.time ? ` — ${scene.time}` : ''}` : '…'}
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
          <button
            onClick={() => setShowSeating((v) => !v)}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-faint)',
              textDecoration: 'underline',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
            }}
          >
            plan de table
          </button>
          <button
            onClick={() => setShowClues((v) => !v)}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: discoveredClues.length > 0 ? 'var(--color-primary)' : 'var(--color-text-faint)',
              textDecoration: 'underline',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
            }}
          >
            {discoveredClues.length} indice{discoveredClues.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>

      {/* ── Plan de table toggle ── */}
      {showSeating && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <SeatingPlan
            state={storeRun ?? run}
            showHistory
            highlightSeat={scene?.id === 'scene_08_critical_service' ? 2 : undefined}
          />
        </div>
      )}

      {/* ── Panneau indices toggle ── */}
      {showClues && (
        <div style={{
          marginBottom: 'var(--space-6)',
          padding: 'var(--space-4)',
          background: 'var(--color-surface-offset)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-divider)',
        }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 'var(--space-4)',
          }}>Indices découverts</p>
          <CluePanel discoveredClues={discoveredClues.map((dc) => (typeof dc === 'string' ? dc : dc.clueId))} />
        </div>
      )}

      {/* ── Erreur ── */}
      {error && (
        <div style={{
          padding: 'var(--space-3) var(--space-4)',
          background: 'var(--color-error-bg)',
          border: '1px solid var(--color-error)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--space-6)',
        }}>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>{error}</p>
        </div>
      )}

      {/* ── Mini-jeu morpion ── */}
      {phase === 'minigame' && activeMinigame === 'morpion' && (
        <MorpionMinigame
          players={['sarah', 'yanis']}
          onComplete={handleMinigameComplete}
        />
      )}

      {/* ── Scène normale ── */}
      {(phase === 'narrative' || phase === 'choices' || phase === 'transition' || phase === 'done') && scene && (
        <>
          {/* Titre */}
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xl)',
            color: 'var(--color-text)',
            marginBottom: 'var(--space-6)',
            fontWeight: 500,
          }}>
            {scene.title}
          </h2>

          {/* Texte narratif */}
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'var(--color-text-muted)',
            lineHeight: '1.8',
            marginBottom: 'var(--space-8)',
            whiteSpace: 'pre-wrap',
          }}>
            {scene.narrative}
          </p>

          {/* Faits canoniques (petite note de bas de scène) */}
          {scene.canonicalFacts.length > 0 && phase === 'transition' && (
            <ul style={{
              marginBottom: 'var(--space-6)',
              paddingLeft: 'var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-1)',
            }}>
              {scene.canonicalFacts.map((fact, i) => (
                <li key={i} style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--color-text-faint)',
                  fontStyle: 'italic',
                  listStyle: 'none',
                  paddingLeft: 0,
                }}>
                  — {fact}
                </li>
              ))}
            </ul>
          )}

          {/* Choix */}
          {(phase === 'narrative' || phase === 'choices') && !choiceMade && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {choices.map((choice) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice)}
                  style={{
                    textAlign: 'left',
                    padding: 'var(--space-4) var(--space-6)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all var(--transition)',
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: 'var(--space-3)',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    flexShrink: 0,
                  }}>
                    {choice.verb}
                  </span>
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text)',
                  }}>
                    {choice.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* État de transition : choix confirmé + indices révélés */}
          {(phase === 'transition' || phase === 'done') && choiceMade && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div style={{
                padding: 'var(--space-4) var(--space-6)',
                background: 'var(--color-primary-highlight)',
                border: '1px solid var(--color-primary)',
                borderRadius: 'var(--radius-md)',
              }}>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text)' }}>
                  {choiceMade.label}
                </p>
              </div>

              {/* Notes narratives */}
              {narrativeNotes.map((note, i) => (
                <p key={i} style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  color: 'var(--color-text-muted)',
                  fontStyle: 'italic',
                  lineHeight: '1.7',
                }}>
                  {note}
                </p>
              ))}

              {/* Indices révélés */}
              {cluesJustRevealed.length > 0 && (
                <div style={{
                  padding: 'var(--space-3) var(--space-4)',
                  background: 'var(--color-surface-offset)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-divider)',
                }}>
                  {cluesJustRevealed.map((clueId) => (
                    <p key={clueId} style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-primary)',
                      fontStyle: 'italic',
                    }}>
                      Indice {clueId} découvert.
                    </p>
                  ))}
                </div>
              )}

              <button
                onClick={handleNext}
                style={{
                  alignSelf: 'flex-start',
                  padding: 'var(--space-3) var(--space-8)',
                  background: 'var(--color-primary)',
                  color: 'var(--color-text-inverse)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'var(--font-body)',
                  fontSize: 'var(--text-sm)',
                  letterSpacing: '0.04em',
                  cursor: 'pointer',
                  transition: 'all var(--transition)',
                }}
              >
                {phase === 'done' ? 'Voir le dénouement →' : 'Scène suivante →'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
