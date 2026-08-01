'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useRunStore } from '@/store/runStore'
import { CluePanel } from './CluePanel'
import { SeatingPlan } from './SeatingPlan'
import { MorpionMinigame } from './MorpionMinigame'
import { ToneMinigame } from './ToneMinigame'
import { DosageMinigame } from './DosageMinigame'
import { VariableGauges } from './VariableGauges'
import { ManuscriptPanel } from './ManuscriptPanel'
import { ImageSlot } from './ImageSlot'
import { CHARACTERS } from './CharacterCard'
import { getChapterNumberForScene } from '@/lib/engine/chapters'
import { SCENE_IMAGE } from '@/lib/engine/sceneImages'
import { RELATIONSHIP_MATRIX, relationshipLabel } from '@/lib/engine/backstory'
import { computeImpairment, scrambleText } from '@/lib/engine/overheard'
import type { CharacterId } from '@/lib/types/characters'
import type { SceneId } from '@/lib/types/scenes'
import type { RunState } from '@/types'

interface SceneData {
  id: string
  index: number
  title: string
  time?: string
  narrative: string
  minigameId?: string | null
  canonicalFacts: string[]
  overheard?: string | null
}

interface ChoiceData {
  id: string
  verb: string
  label: string
  description?: string | null
  /** Texte présenté au joueur — flouté/mélangé sous forte tension ou ivresse ambiante, calculé une fois au chargement de la scène. */
  displayLabel?: string
  blurPx?: number
}

interface SceneEngineProps {
  runId: string
  playerPov: CharacterId
  initialSceneId: string
  run: RunState
}

type Phase = 'loading' | 'narrative' | 'choices' | 'minigame' | 'transition' | 'done'

// Mini-jeux effectivement implémentés en UI. audio_reconstruction (scènes
// 10-11) n'est volontairement pas ici : il a été remplacé par les
// conversations entendues en texte (lib/engine/overheard.ts), pas par un
// mini-jeu — la narration et les choix s'affichent normalement à sa place.
const IMPLEMENTED_MINIGAMES = ['tictactoe_hidden', 'tone_puzzle', 'dosage_order']

export function SceneEngine({ runId, playerPov, initialSceneId, run }: SceneEngineProps) {
  const router = useRouter()
  const { advance, loadCurrentScene, run: storeRun } = useRunStore()

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
  const [showGauges, setShowGauges] = useState(false)
  const [showManuscript, setShowManuscript] = useState(false)
  const [showRelations, setShowRelations] = useState(false)

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

      // Sous forte tension ou forte ivresse ambiante, les options elles-mêmes
      // se troublent — pas juste ce qu'on entend. Calculé une seule fois ici
      // (pas au rendu) pour ne pas re-mélanger le texte à chaque re-render.
      const liveState = storeRun ?? run
      const tension = liveState.variable.socialTension ?? 0
      const impairment = computeImpairment(liveState, playerPov)
      const tensionChaos = tension >= 70 ? ((tension - 70) / 30) * 0.3 : 0
      const impairmentChaos = impairment >= 40 ? ((impairment - 40) / 60) * 0.35 : 0
      const scrambleIntensity = Math.max(tensionChaos, impairmentChaos)
      const blurPx = tension >= 60 ? Math.min(2.5, ((tension - 60) / 40) * 2.5) : 0

      const distortedChoices: ChoiceData[] = data.choices.map((c: ChoiceData) => ({
        ...c,
        displayLabel: scrambleIntensity > 0 ? scrambleText(c.label, scrambleIntensity) : c.label,
        blurPx,
      }))
      setChoices(distortedChoices)
      const hasMinigame = Boolean(data.scene.minigameId) && IMPLEMENTED_MINIGAMES.includes(data.scene.minigameId)
      setActiveMinigame(hasMinigame ? data.scene.minigameId : null)
      setPhase(hasMinigame ? 'minigame' : 'narrative')
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

    // Le mini-jeu de la prochaine scène (s'il y en a un) se lance quand la
    // scène est chargée via fetchScene() (bouton "Continuer" → handleNext),
    // pas ici : ça garantit que scene/choices sont toujours à jour avant
    // d'afficher quoi que ce soit, et ça évite de relancer le mini-jeu de la
    // scène qu'on quitte quand elle a des choix après lui (scènes 5, 3, 8).
    setPhase('transition')
  }

  function handleNext() {
    if (phase === 'done') {
      router.push(`/run/${runId}/final`)
      return
    }

    // Frontière de chapitre : la scène qu'on s'apprête à charger appartient à
    // un chapitre sans personnage assigné → passer par le choix de POV.
    const current = storeRun ?? run
    const povHistory = current.povHistory ?? [current.playerPov]
    const nextChapter = getChapterNumberForScene(current.currentScene)
    if (nextChapter !== null && nextChapter > povHistory.length) {
      router.push(`/run/${runId}/chapter`)
      return
    }

    setChoiceMade(null)
    setCluesJustRevealed([])
    setNarrativeNotes([])
    fetchScene()
  }

  async function handleMinigameComplete(result: { winner: CharacterId | null; serviceHelper: CharacterId }) {
    const nextVariable = {
      ...((storeRun ?? run).variable),
      serviceHelper: result.serviceHelper,
    }
    await syncMinigameVariable(nextVariable)
  }

  async function handleToneComplete(result: { tensionDelta: number }) {
    // Chaque lecture choisie porte son propre effet sur la tension — voir
    // ToneMinigame.tsx : ce n'est pas une bonne ou une mauvaise réponse,
    // juste une interprétation qui a des conséquences.
    const current = (storeRun ?? run).variable
    const nextVariable = {
      ...current,
      socialTension: Math.max(0, Math.min(100, (current.socialTension ?? 0) + result.tensionDelta)),
    }
    await syncMinigameVariable(nextVariable)
  }

  async function handleDosageComplete(result: { orderedCorrectly: boolean; mistakes: number }) {
    // Service maîtrisé : léger apaisement. Service confus : la tension monte.
    const delta = result.orderedCorrectly ? -3 : result.mistakes * 3
    const current = (storeRun ?? run).variable
    const nextVariable = {
      ...current,
      socialTension: Math.max(0, Math.min(100, (current.socialTension ?? 0) + delta)),
    }
    await syncMinigameVariable(nextVariable)
  }

  // Persister le résultat d'un mini-jeu tout de suite côté serveur (route
  // admin, pas le SDK client) : sinon le prochain advance() relit l'ancien
  // variable depuis Firestore et perd le résultat du mini-jeu.
  async function syncMinigameVariable(nextVariable: RunState['variable']) {
    useRunStore.getState().updateRunLocal({ variable: nextVariable })
    setActiveMinigame(null)
    setPhase('choices')
    try {
      const res = await fetch(`/api/run/${runId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variable: nextVariable }),
      })
      if (!res.ok) throw new Error('sync failed')
    } catch (err) {
      console.error('[syncMinigameVariable] échec de synchronisation:', err)
      setError('Erreur de synchronisation du mini-jeu. Réessayez si le comportement semble incohérent.')
    }
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

  const socialTension = (storeRun ?? run).variable.socialTension ?? 0

  return (
    <div style={{ width: '100%', maxWidth: 'var(--content-narrow)' }}>

      {/* ── Tension — toujours visible, pas un toggle ── */}
      <div
        title={`Tension sociale : ${Math.round(socialTension)}/100`}
        style={{
          width: '100%',
          height: 3,
          borderRadius: 2,
          background: 'var(--color-surface-offset)',
          overflow: 'hidden',
          marginBottom: 'var(--space-4)',
        }}
      >
        <div style={{
          width: `${Math.max(0, Math.min(100, socialTension))}%`,
          height: '100%',
          background: socialTension >= 70 ? 'var(--color-error)' : 'var(--color-primary)',
          transition: 'width 500ms ease, background 500ms ease',
        }} />
      </div>

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
          <button
            onClick={() => setShowGauges((v) => !v)}
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
            tensions
          </button>
          <button
            onClick={() => setShowManuscript((v) => !v)}
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
            manuscrit
          </button>
          <button
            onClick={() => setShowRelations((v) => !v)}
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
            relations
          </button>
        </div>
      </div>

      {/* ── Plan de table toggle ── */}
      {showSeating && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <SeatingPlan
            state={storeRun ?? run}
            highlightSeat={scene?.id === 'scene_08_critical_service' ? 2 : undefined}
          />
        </div>
      )}

      {/* ── Jauges des personnages toggle ── */}
      {showGauges && (
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
          }}>
            Tensions du groupe — vos choix affectent aussi les autres
          </p>
          <VariableGauges
            characterState={(storeRun ?? run).variable.characterState}
            currentPov={playerPov}
          />
        </div>
      )}

      {/* ── Manuscrit toggle ── */}
      {showManuscript && (
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
          }}>
            Le manuscrit — la vérité se complète avec vos indices
          </p>
          <ManuscriptPanel state={storeRun ?? run} />
        </div>
      )}

      {/* ── Relations toggle — ce que le POV incarné ressent envers chacun ── */}
      {showRelations && (
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
          }}>
            Ce que {CHARACTERS.find((c) => c.id === playerPov)?.firstName} ressent, envers chacun
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {CHARACTERS.filter((c) => c.id !== playerPov).map((c) => {
              const rel = RELATIONSHIP_MATRIX[playerPov]?.[c.id]
              if (!rel) return null
              const positive = rel.value >= 0
              return (
                <div key={c.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
                      → {c.firstName}
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-faint)' }}>
                      {relationshipLabel(rel.value)}{rel.note ? ` · ${rel.note}` : ''}
                    </span>
                  </div>
                  <div style={{ height: 4, background: 'var(--color-surface)', borderRadius: 999, overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                      position: 'absolute',
                      left: positive ? '50%' : `${50 - Math.abs(rel.value) / 2}%`,
                      width: `${Math.abs(rel.value) / 2}%`,
                      height: '100%',
                      background: positive ? 'var(--color-primary)' : 'var(--color-error, #a01f1f)',
                    }} />
                  </div>
                </div>
              )
            })}
          </div>
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
      {phase === 'minigame' && activeMinigame === 'tictactoe_hidden' && (
        <MorpionMinigame
          players={['sarah', 'yanis']}
          playerPov={playerPov}
          onComplete={handleMinigameComplete}
        />
      )}

      {/* ── Mini-jeu lecture de tonalité (scène 3) ── */}
      {phase === 'minigame' && activeMinigame === 'tone_puzzle' && (
        <ToneMinigame playerPov={playerPov} onComplete={handleToneComplete} />
      )}

      {/* ── Mini-jeu service critique (scène 8) ── */}
      {phase === 'minigame' && activeMinigame === 'dosage_order' && (
        <DosageMinigame
          seatingBeforeMain={(storeRun ?? run).variable.seatingHistory?.seating_before_main}
          onComplete={handleDosageComplete}
        />
      )}

      {/* ── Scène normale ── */}
      {(phase === 'narrative' || phase === 'choices' || phase === 'transition' || phase === 'done') && scene && (
        <>
          {/* Illustration de scène — n'occupe aucun espace tant que le fichier n'existe pas, voir docs/images-manifest.md */}
          {SCENE_IMAGE[scene.id as SceneId] && (
            <ImageSlot
              mode="banner"
              scrim
              src={SCENE_IMAGE[scene.id as SceneId]!}
              alt=""
              style={{ marginBottom: 'var(--space-6)' }}
            />
          )}

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

          {/* Conversation entendue — différente selon le personnage, dégradée par l'ivresse */}
          {scene.overheard && (
            <div style={{
              marginBottom: 'var(--space-8)',
              padding: 'var(--space-4) var(--space-5)',
              background: 'var(--color-surface-offset)',
              borderLeft: '2px solid var(--color-primary)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-faint)',
                textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-2)',
              }}>
                Vous entendez
              </p>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontStyle: 'italic',
                color: 'var(--color-text-muted)', lineHeight: 1.7,
              }}>
                {scene.overheard}
              </p>
            </div>
          )}

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
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-sm)',
                    color: 'var(--color-text)',
                    filter: choice.blurPx ? `blur(${choice.blurPx}px)` : 'none',
                    transition: 'filter 400ms ease',
                  }}>
                    {choice.displayLabel ?? choice.label}
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
