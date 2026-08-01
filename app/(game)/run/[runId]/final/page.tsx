'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useRunStore } from '@/store/runStore'
import { CHARACTERS } from '@/components/ui/CharacterCard'
import type { CharacterId } from '@/lib/types/characters'

interface ManuscriptEntryData {
  id: string
  text: string
  status: 'locked' | 'partial' | 'complete'
  progress: number
}

interface PovSummaryData {
  character: CharacterId
  chapterNumber: number
  chapterTitle: string
  choiceLabels: string[]
}

type CharacterCondition = 'indemne' | 'ebranle' | 'blesse' | 'critique' | 'decede'

interface EpilogueStatusData {
  character: CharacterId
  condition: CharacterCondition
  detail: string
}

interface EpilogueData {
  gravity: number
  headline: string
  paragraph: string
  statuses: EpilogueStatusData[]
}

const SEAT_IDS = [1, 2, 3, 4, 5, 6]

const CONDITION_LABELS: Record<CharacterCondition, { label: string; color: string }> = {
  indemne: { label: 'Indemne', color: 'var(--color-text-faint)' },
  ebranle: { label: 'Ébranlé·e', color: '#a67c1f' },
  blesse: { label: 'Blessé·e', color: '#b5651d' },
  critique: { label: 'État critique', color: '#a01f1f' },
  decede: { label: 'N’a pas survécu', color: '#6b0f0f' },
}

const ENDING_LABELS: Record<string, { title: string; description: string }> = {
  F1: {
    title: 'Silence moral',
    description: 'La version de Sarah-fragile-aux-médicaments est la seule qui restera. Vous étiez là. Vous n\'avez rien dit.',
  },
  F2: {
    title: 'Témoin incomplet',
    description: 'Vous avez parlé, mais pas assez. Il manquait quelque chose — et ce qui manque laisse de la place pour les autres versions.',
  },
  F3: {
    title: 'Vérité partielle',
    description: 'Vous avez vu juste sur une partie. Ce que vous n\'avez pas dit sera dit par quelqu\'un d\'autre, dans dix ans, différemment.',
  },
  F4: {
    title: 'Confrontation',
    description: 'Vous avez parlé à Maëlys, pas au groupe. La vérité s\'est arrêtée là où vous avez décidé qu\'elle s\'arrêterait.',
  },
  F5: {
    title: 'Accélération',
    description: 'Le vocal et la parole au même moment — trop, trop vite. La vérité a percuté quelque chose avant d\'atterrir.',
  },
  D1: {
    title: 'Déviation — L\'assiette',
    description: 'Vous avez pris l\'assiette de Sarah. La chaîne s\'est interrompue. L\'incident n\'a pas eu lieu de la même façon.',
  },
  D2: {
    title: 'Déviation — Le jeu',
    description: 'Vous avez interrompu le morpion. Yanis a servi. La cible prévue n\'a pas été la cible atteinte.',
  },
  S1: {
    title: 'La charpente vraie',
    description: 'Vous avez tout vu, tout rassemblé, et tout dit. Il y a une version de la soirée qui est vraie — et c\'est la vôtre.',
  },
}

interface FinalReport {
  planned: Record<string, string>
  actual: Record<string, string>
  narrated: Record<string, string>
}

const COLUMN_LABELS: Record<string, string> = {
  targetWho: 'Qui',
  targetWhy: 'Pourquoi',
  mechanism: 'Comment',
  whoKnew: 'Qui savait',
  whatsaid: 'Ce qui a été dit',
}

// Chapitre 14 de la bible : la dernière ligne, seule, sans commentaire.
// Sarah n'est épargnée que dans la fin déviée D1 (« Vous avez pris l'assiette
// de Sarah — la chaîne s'est interrompue »).
function lastLine(endingId: string): string {
  return endingId === 'D1'
    ? "Elle n'a rien dit. On ne lui a rien demandé."
    : 'Sarah Kessler avait raison sur tout, sauf sur l\'ordre.'
}

export default function FinalPage() {
  const params = useParams()
  const router = useRouter()
  const runId = params.runId as string
  const { run } = useRunStore()

  const [report, setReport] = useState<FinalReport | null>(null)
  const [manuscript, setManuscript] = useState<ManuscriptEntryData[]>([])
  const [epilogue, setEpilogue] = useState<EpilogueData | null>(null)
  const [recap, setRecap] = useState<string[]>([])
  const [povHistory, setPovHistory] = useState<CharacterId[]>([])
  const [povSummaries, setPovSummaries] = useState<PovSummaryData[]>([])
  const [endingId, setEndingId] = useState<string | null>(null)
  const [clueCount, setClueCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState<number | null>(null)
  const [seatingBonusAvailable, setSeatingBonusAvailable] = useState(false)
  const [seatingGuess, setSeatingGuess] = useState<Record<number, CharacterId>>({})
  const [submittingSeating, setSubmittingSeating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [culprit, setCulprit] = useState<CharacterId | null>(null)
  const [deceasedCharacter, setDeceasedCharacter] = useState<CharacterId | null>(null)
  const [culpritGuess, setCulpritGuess] = useState<CharacterId | null>(null)
  const [deathGuess, setDeathGuess] = useState<CharacterId | 'none' | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    if (!runId) return
    fetch(`/api/run/${runId}/final`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error ?? 'Impossible de charger le rapport final')
        }
        const data = await res.json()
        setReport(data.report ?? null)
        setManuscript(data.manuscript ?? [])
        setEpilogue(data.epilogue ?? null)
        setPovHistory(data.povHistory ?? [])
        setPovSummaries(data.povSummaries ?? [])
        setEndingId(data.ending ?? run?.ending ?? 'F1')
        setClueCount(data.discoveredCluesCount ?? run?.discoveredClues?.length ?? 0)
        setScore(data.score ?? null)
        setSeatingBonusAvailable(Boolean(data.seatingBonusAvailable))
        setRecap(data.recap ?? [])
        setCulprit(data.culprit ?? null)
        setDeceasedCharacter(data.deceasedCharacter ?? null)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur inconnue'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId])

  async function handleSubmitSeating() {
    if (submittingSeating) return
    setSubmittingSeating(true)
    setError(null)
    try {
      const res = await fetch(`/api/run/${runId}/final`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seatingGuess }),
      })
      if (!res.ok) throw new Error('Erreur lors du calcul du bonus')
      const data = await res.json()
      setScore(data.score)
      setSeatingBonusAvailable(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSubmittingSeating(false)
    }
  }

  const ending = ENDING_LABELS[endingId ?? 'F1'] ?? ENDING_LABELS.F1
  const seatingComplete = SEAT_IDS.every((seat) => seatingGuess[seat])

  if (loading) {
    return (
      <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)', fontStyle: 'italic' }}>
          Chargement…
        </p>
      </main>
    )
  }

  return (
    <main style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 'var(--space-16) var(--space-8)',
    }}>
      <div style={{ width: '100%', maxWidth: 'var(--content-narrow)' }}>

        {error && (
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-error)',
            padding: 'var(--space-3) var(--space-4)', background: 'var(--color-error-bg)',
            border: '1px solid var(--color-error)', borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--space-8)',
          }}>{error}</p>
        )}

        {/* Avant la révélation — deviner, une dernière fois, avant de savoir */}
        {!revealed && (
          <div>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)',
              textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 'var(--space-4)',
            }}>
              Avant de savoir
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text)',
              fontWeight: 400, fontStyle: 'italic', marginBottom: 'var(--space-8)', lineHeight: 1.2,
            }}>
              Qu&apos;est-ce qui s&apos;est vraiment passé, selon vous ?
            </h1>

            <div style={{ marginBottom: 'var(--space-8)' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text)', marginBottom: 'var(--space-3)' }}>
                Qui a organisé ce qui est arrivé, ce soir-là ?
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {CHARACTERS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCulpritGuess(c.id)}
                    style={{
                      padding: 'var(--space-2) var(--space-4)',
                      background: culpritGuess === c.id ? `${c.color}20` : 'var(--color-surface)',
                      border: `1px solid ${culpritGuess === c.id ? c.color : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                      color: culpritGuess === c.id ? c.color : 'var(--color-text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {c.firstName}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 'var(--space-10)' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text)', marginBottom: 'var(--space-3)' }}>
                Qui n&apos;a pas survécu à cette nuit ?
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <button
                  onClick={() => setDeathGuess('none')}
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    background: deathGuess === 'none' ? 'var(--color-surface-offset)' : 'var(--color-surface)',
                    border: `1px solid ${deathGuess === 'none' ? 'var(--color-text-muted)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                    color: deathGuess === 'none' ? 'var(--color-text)' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  Personne
                </button>
                {CHARACTERS.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setDeathGuess(c.id)}
                    style={{
                      padding: 'var(--space-2) var(--space-4)',
                      background: deathGuess === c.id ? `${c.color}20` : 'var(--color-surface)',
                      border: `1px solid ${deathGuess === c.id ? c.color : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                      color: deathGuess === c.id ? c.color : 'var(--color-text-muted)',
                      cursor: 'pointer',
                    }}
                  >
                    {c.firstName}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setRevealed(true)}
              disabled={!culpritGuess || !deathGuess}
              style={{
                padding: 'var(--space-3) var(--space-8)',
                background: 'var(--color-primary)',
                color: 'var(--color-text-inverse)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                letterSpacing: '0.04em',
                cursor: culpritGuess && deathGuess ? 'pointer' : 'not-allowed',
                opacity: culpritGuess && deathGuess ? 1 : 0.5,
              }}
            >
              Découvrir la suite →
            </button>
          </div>
        )}

        {revealed && (
        <>
        {/* Verdict — vos intuitions, confrontées aux faits */}
        {culprit && deathGuess && (
          <div style={{
            marginBottom: 'var(--space-10)',
            padding: 'var(--space-5)',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-divider)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-3)',
            }}>
              Votre intuition
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', lineHeight: 1.7 }}>
              {culpritGuess === culprit ? '✓ ' : '✗ '}
              Vous {culpritGuess === culprit ? 'aviez' : 'n\'aviez pas'} deviné que {CHARACTERS.find((c) => c.id === culprit)?.firstName} avait organisé la soirée.
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              {(deathGuess === 'none' ? deceasedCharacter === null : deathGuess === deceasedCharacter) ? '✓ ' : '✗ '}
              {deceasedCharacter
                ? `Vous ${deathGuess === deceasedCharacter ? 'aviez' : 'n\'aviez pas'} deviné que ${CHARACTERS.find((c) => c.id === deceasedCharacter)?.firstName} n'allait pas survivre.`
                : `Vous ${deathGuess === 'none' ? 'aviez' : 'n\'aviez pas'} deviné que tout le monde allait s'en sortir.`}
            </p>
          </div>
        )}

        {/* Titre fin */}
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-faint)',
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: 'var(--space-4)',
        }}>
          Fin — {endingId}
        </p>

        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          color: 'var(--color-text)',
          fontWeight: 400,
          fontStyle: 'italic',
          marginBottom: 'var(--space-4)',
          lineHeight: 1.2,
        }}>
          {ending.title}
        </h1>

        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-base)',
          color: 'var(--color-text-muted)',
          lineHeight: '1.8',
          marginBottom: 'var(--space-12)',
        }}>
          {ending.description}
        </p>

        {/* Score indices */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-8)',
          marginBottom: 'var(--space-12)',
          paddingBottom: 'var(--space-8)',
          borderBottom: '1px solid var(--color-divider)',
        }}>
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-1)' }}>
              Indices
            </p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text)' }}>
              {clueCount}<span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)' }}>/25</span>
            </p>
          </div>
          {score !== null && (
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-1)' }}>
                Score — ce que vous avez vraiment compris
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text)' }}>
                {score}<span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)' }}>/100</span>
              </p>
            </div>
          )}
        </div>

        {/* Bilan de la soirée — épilogue selon la tension accumulée */}
        {epilogue && (
          <div style={{ marginBottom: 'var(--space-12)' }}>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-4)',
            }}>
              Bilan de la soirée
            </p>
            <div style={{
              padding: 'var(--space-5)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: 'var(--space-4)',
            }}>
              <p style={{
                fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-lg)',
                color: 'var(--color-text)', marginBottom: 'var(--space-3)',
              }}>
                {epilogue.headline}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.8 }}>
                {epilogue.paragraph}
              </p>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
              {epilogue.statuses.map((s) => {
                const character = CHARACTERS.find((c) => c.id === s.character)
                const cond = CONDITION_LABELS[s.condition]
                return (
                  <div
                    key={s.character}
                    title={s.detail}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 'var(--space-2)',
                      padding: 'var(--space-2) var(--space-3)',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${character?.color ?? 'var(--color-border)'}30`,
                      background: 'var(--color-surface-offset)',
                    }}
                  >
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: character?.color ?? 'var(--color-text)' }}>
                      {character?.firstName ?? s.character}
                    </span>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: cond.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {cond.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Moments marquants — recap concret de ce qui s'est vraiment passé cette partie */}
        {recap.length > 0 && (
          <div style={{ marginBottom: 'var(--space-12)' }}>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-4)',
            }}>
              Moments marquants
            </p>
            <ul style={{ margin: 0, paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {recap.map((line, i) => (
                <li key={i} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
                  {line}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Rapport final 3 colonnes */}
        {report && (
          <>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 'var(--space-4)',
            }}>
              Ce qui s&apos;est passé
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-12)',
            }}>
              {(['planned', 'actual', 'narrated'] as const).map((col) => (
                <div
                  key={col}
                  style={{
                    padding: 'var(--space-4)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <p style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--color-primary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 'var(--space-3)',
                  }}>
                    {col === 'planned' ? 'Prévu' : col === 'actual' ? 'Réel' : 'Dit'}
                  </p>
                  {Object.entries(report[col]).map(([key, value]) => (
                    <div key={key} style={{ marginBottom: 'var(--space-2)' }}>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                        {COLUMN_LABELS[key] ?? key}
                      </p>
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Bonus optionnel — reconstituer le plan de table du moment critique */}
        {seatingBonusAvailable && (
          <div style={{ marginBottom: 'var(--space-12)' }}>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)',
              textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-2)',
            }}>
              Bonus — +15 points possibles
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)', fontStyle: 'italic', marginBottom: 'var(--space-4)' }}>
              Qui était où, au moment critique du service ? Placez les six convives, si vous vous en souvenez.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)', maxWidth: 360, marginBottom: 'var(--space-4)' }}>
              {SEAT_IDS.map((seat) => (
                <div key={seat} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                  <label style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-faint)' }}>
                    Siège {seat}
                  </label>
                  <select
                    value={seatingGuess[seat] ?? ''}
                    onChange={(e) => setSeatingGuess((prev) => ({ ...prev, [seat]: e.target.value as CharacterId }))}
                    style={{
                      padding: 'var(--space-2) var(--space-3)',
                      background: 'var(--color-surface)',
                      border: '1px solid var(--color-border)',
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text)',
                    }}
                  >
                    <option value="">—</option>
                    {CHARACTERS.map((c) => (
                      <option key={c.id} value={c.id}>{c.firstName}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <button
              onClick={handleSubmitSeating}
              disabled={!seatingComplete || submittingSeating}
              style={{
                padding: 'var(--space-3) var(--space-8)',
                background: 'var(--color-primary)',
                color: 'var(--color-text-inverse)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                letterSpacing: '0.04em',
                cursor: seatingComplete && !submittingSeating ? 'pointer' : 'not-allowed',
                opacity: seatingComplete && !submittingSeating ? 1 : 0.5,
              }}
            >
              {submittingSeating ? 'Calcul…' : 'Valider le plan de table'}
            </button>
          </div>
        )}

        {/* Ma vérité — un résumé par personnage joué, sur ce qu'il a choisi */}
        {povSummaries.length > 0 && (
          <div style={{ marginBottom: 'var(--space-12)' }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 'var(--space-4)',
            }}>
              Ma vérité
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {povSummaries.map((s) => {
                const character = CHARACTERS.find((c) => c.id === s.character)
                return (
                  <div
                    key={s.chapterNumber}
                    style={{
                      padding: 'var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      border: `1px solid ${character?.color ?? 'var(--color-border)'}30`,
                      background: 'var(--color-surface)',
                    }}
                  >
                    <p style={{
                      fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-base)',
                      color: character?.color ?? 'var(--color-text)', marginBottom: 'var(--space-2)',
                    }}>
                      {character?.firstName ?? s.character} — chapitre {s.chapterNumber} · {s.chapterTitle}
                    </p>
                    {s.choiceLabels.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: 'var(--space-5)' }}>
                        {s.choiceLabels.map((label, i) => (
                          <li key={i} style={{
                            fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)',
                            marginBottom: 'var(--space-1)',
                          }}>
                            {label}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', fontStyle: 'italic' }}>
                        Aucun choix enregistré.
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Le manuscrit — uniquement ce qui a été réellement établi. Ce qui
            n'a pas été débloqué ne s'affiche pas ici, même en teaser flouté :
            à ce stade (fin de partie), le montrer spoilerait la prochaine
            partie avec un autre point de vue plutôt que de donner envie d'y
            revenir. */}
        {manuscript.length > 0 && (
          <div style={{ marginBottom: 'var(--space-12)' }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 'var(--space-4)',
            }}>
              Le manuscrit — {manuscript.filter((e) => e.status === 'complete').length} / {manuscript.length} vérités établies
            </p>
            {manuscript.some((e) => e.status === 'complete') ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                {manuscript.filter((e) => e.status === 'complete').map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      padding: 'var(--space-3) var(--space-4)',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--color-border)',
                      background: 'var(--color-primary-highlight)',
                    }}
                  >
                    <p style={{
                      fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-sm)',
                      color: 'var(--color-text-muted)', lineHeight: 1.6,
                    }}>
                      {entry.text}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', fontStyle: 'italic' }}>
                Aucune vérité établie cette fois-ci — rien à montrer que vous n&apos;ayez pas vous-même découvert.
              </p>
            )}
          </div>
        )}

        {/* Teaser de rejouabilité — sans spoiler, juste avant le bouton */}
        {povHistory.length > 0 && (() => {
          const unplayed = CHARACTERS.filter((c) => !povHistory.includes(c.id))
          if (unplayed.length === 0) return null
          return (
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontStyle: 'italic',
              color: 'var(--color-text-faint)', marginBottom: 'var(--space-4)',
            }}>
              {unplayed.map((c) => c.firstName).join(' et ')} n&apos;{unplayed.length > 1 ? 'ont' : 'a'} pas pris la parole cette fois-ci. Ce qu&apos;{unplayed.length > 1 ? 'ils ont' : 'elle a'} vu reste à découvrir.
            </p>
          )
        })()}

        {/* CTA rejouer */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', marginBottom: 'var(--space-12)' }}>
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              padding: 'var(--space-3) var(--space-8)',
              background: 'var(--color-primary)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              letterSpacing: '0.04em',
              cursor: 'pointer',
            }}
          >
            Rejouer
          </button>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: 'var(--space-3) var(--space-8)',
              background: 'transparent',
              color: 'var(--color-text-muted)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              letterSpacing: '0.04em',
              cursor: 'pointer',
            }}
          >
            Accueil
          </button>
        </div>

        {/* Dernière ligne — chapitre 14, seule, sans commentaire */}
        <p style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-lg)',
          fontStyle: 'italic',
          color: 'var(--color-text-faint)',
          textAlign: 'center',
          paddingTop: 'var(--space-8)',
          borderTop: '1px solid var(--color-divider)',
        }}>
          {lastLine(endingId ?? 'F1')}
        </p>
        </>
        )}

      </div>
    </main>
  )
}
