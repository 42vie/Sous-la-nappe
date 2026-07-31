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

const SEATING_QUESTION_ID = 'q4_seating_at_service'
const SEAT_IDS = [1, 2, 3, 4, 5, 6]

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

interface FinalQuestionOption {
  id: string
  label: string
}

interface FinalQuestion {
  id: string
  index: number
  label: string
  weight: number
  options: FinalQuestionOption[]
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
  const [questions, setQuestions] = useState<FinalQuestion[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [seatingGuess, setSeatingGuess] = useState<Record<number, CharacterId>>({})
  const [manuscript, setManuscript] = useState<ManuscriptEntryData[]>([])
  const [endingId, setEndingId] = useState<string | null>(null)
  const [clueCount, setClueCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

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
        setQuestions(data.questions ?? [])
        setManuscript(data.manuscript ?? [])
        setEndingId(data.ending ?? run?.ending ?? 'F1')
        setClueCount(data.discoveredCluesCount ?? run?.discoveredClues?.length ?? 0)
        if (data.score !== null && data.score !== undefined) {
          setScore(data.score)
          setAnswers(data.answers ?? {})
          if (data.seatingGuess) setSeatingGuess(data.seatingGuess)
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur inconnue'))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [runId])

  async function handleSubmitQuiz() {
    if (submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/run/${runId}/final`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, seatingGuess }),
      })
      if (!res.ok) throw new Error('Erreur lors du calcul du score')
      const data = await res.json()
      setScore(data.score)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setSubmitting(false)
    }
  }

  const ending = ENDING_LABELS[endingId ?? 'F1'] ?? ENDING_LABELS.F1
  const seatingComplete = SEAT_IDS.every((seat) => seatingGuess[seat])
  const quizComplete = questions.length > 0 && questions.every((q) =>
    q.id === SEATING_QUESTION_ID ? seatingComplete : answers[q.id]
  )
  const quizPending = score === null

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

        {/* ── Quiz de reconstruction (chapitre 14) ── */}
        {quizPending && questions.length > 0 && (
          <>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)',
              textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 'var(--space-4)',
            }}>
              Avant le rapport
            </p>
            <h1 style={{
              fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text)',
              fontWeight: 400, fontStyle: 'italic', marginBottom: 'var(--space-8)', lineHeight: 1.2,
            }}>
              Qu&apos;avez-vous vraiment compris de cette soirée ?
            </h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)', marginBottom: 'var(--space-8)' }}>
              {questions.map((q) => (
                <div key={q.id}>
                  <p style={{
                    fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text)',
                    marginBottom: 'var(--space-3)',
                  }}>
                    {q.index}. {q.label}
                  </p>
                  {q.id === SEATING_QUESTION_ID ? (
                    <div style={{
                      display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)',
                      maxWidth: 360,
                    }}>
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
                  ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {q.options.map((opt) => (
                      <label
                        key={opt.id}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 'var(--space-3)',
                          padding: 'var(--space-3) var(--space-4)',
                          background: answers[q.id] === opt.id ? 'var(--color-surface-offset)' : 'var(--color-surface)',
                          border: `1px solid ${answers[q.id] === opt.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
                          borderRadius: 'var(--radius-md)', cursor: 'pointer',
                        }}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={opt.id}
                          checked={answers[q.id] === opt.id}
                          onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: opt.id }))}
                        />
                        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={handleSubmitQuiz}
              disabled={!quizComplete || submitting}
              style={{
                padding: 'var(--space-3) var(--space-8)',
                background: 'var(--color-primary)',
                color: 'var(--color-text-inverse)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                letterSpacing: '0.04em',
                cursor: quizComplete && !submitting ? 'pointer' : 'not-allowed',
                opacity: quizComplete && !submitting ? 1 : 0.5,
                marginBottom: 'var(--space-12)',
              }}
            >
              {submitting ? 'Calcul…' : 'Valider'}
            </button>
          </>
        )}

        {/* ── Résultat ── */}
        {!quizPending && (
        <>
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
                Score
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text)' }}>
                {score}<span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)' }}>/100</span>
              </p>
            </div>
          )}
        </div>

        {/* Rapport final 3 colonnes */}
        {!loading && report && (
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

        {/* Le manuscrit — la vérité établie au fil de cette partie */}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {manuscript.map((entry) => (
                <div
                  key={entry.id}
                  style={{
                    padding: 'var(--space-3) var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-border)',
                    background: entry.status === 'complete' ? 'var(--color-primary-highlight)' : 'var(--color-surface)',
                  }}
                >
                  <p style={{
                    fontFamily: entry.status === 'complete' ? 'var(--font-display)' : 'var(--font-body)',
                    fontStyle: entry.status === 'complete' ? 'italic' : 'normal',
                    fontSize: entry.status === 'complete' ? 'var(--text-sm)' : 'var(--text-xs)',
                    color: entry.status === 'locked' ? 'var(--color-text-faint)' : 'var(--color-text-muted)',
                    lineHeight: 1.6,
                  }}>
                    {entry.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

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
