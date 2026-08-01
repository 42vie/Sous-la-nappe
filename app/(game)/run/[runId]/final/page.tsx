'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useRunStore } from '@/store/runStore'
import { CHARACTERS } from '@/components/ui/CharacterCard'
import { EndingQuiz } from '@/components/ui/EndingQuiz'
import { ENDING_SUMMARIES } from '@/lib/engine/endingSummaries'
import { relationshipLabel } from '@/lib/engine/backstory'
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

interface ChronologyPhaseData {
  id: string
  period: string
  label: string
  text: string
}

interface RelationshipEntryData {
  value: number
  note?: string
}

type RelationshipMatrixData = Partial<Record<CharacterId, Partial<Record<CharacterId, RelationshipEntryData>>>>

const SEAT_IDS = [1, 2, 3, 4, 5, 6]

const CONDITION_LABELS: Record<CharacterCondition, { label: string; color: string }> = {
  indemne: { label: 'Indemne', color: 'var(--color-text-faint)' },
  ebranle: { label: 'Ébranlé·e', color: '#a67c1f' },
  blesse: { label: 'Blessé·e', color: '#b5651d' },
  critique: { label: 'État critique', color: '#a01f1f' },
  decede: { label: 'N’a pas survécu', color: '#6b0f0f' },
}

interface FinalReport {
  planned: Record<string, string>
  actual: Record<string, string>
  narrated: Record<string, string>
}

function lowerFirst(s: string): string {
  return s.length > 0 ? s.charAt(0).toLowerCase() + s.slice(1) : s
}

/**
 * Les 3 colonnes du rapport (planned/actual/narrated) sont des couples
 * clé/valeur fixes, produits par buildFinalReport (endingCalculator.ts).
 * Plutôt que de les afficher en liste "label — valeur", on les tisse en
 * une phrase suivie par colonne : c'est un rapport, pas un tableau.
 */
function reportParagraph(col: 'planned' | 'actual' | 'narrated', r: Record<string, string>): string {
  if (col === 'planned') {
    return `Le plan visait ${r.targetWho}, motivé par une ${lowerFirst(r.targetWhy)}. Le moyen choisi : ${lowerFirst(r.mechanism)}. ${r.whoKnew} était dans la confidence. Pour tous les autres, la soirée ne devait être que ${lowerFirst(r.whatsaid)}.`
  }
  if (col === 'actual') {
    const plural = r.targetWho.includes(',')
    const knewClause = r.whoKnew === 'Personne'
      ? "Personne n'a vu le geste au moment où il comptait."
      : `${r.whoKnew} a vu, et n'a rien dit sur le coup.`
    return `Dans les faits, c'est ${r.targetWho} qui a fini par être touché${plural ? '·e·s' : '·e'}. En cause : ${lowerFirst(r.targetWhy)}. ${r.mechanism}. ${knewClause} Ce qui a fini par circuler ensuite : ${lowerFirst(r.whatsaid)}.`
  }
  return `La version qui est ressortie de la maison ne nomme personne. Officiellement, ce n'est qu'un accident : ${lowerFirst(r.targetWhy)}, ${lowerFirst(r.mechanism)}. ${r.whoKnew}. C'est cette histoire-là qui a fini par tenir : ${lowerFirst(r.whatsaid)}.`
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
  const [chronology, setChronology] = useState<ChronologyPhaseData[]>([])
  const [relationshipMatrix, setRelationshipMatrix] = useState<RelationshipMatrixData>({})
  const [povHistory, setPovHistory] = useState<CharacterId[]>([])
  const [povSummaries, setPovSummaries] = useState<PovSummaryData[]>([])
  const [endingId, setEndingId] = useState<string | null>(null)
  const [endingTrigger, setEndingTrigger] = useState<string | null>(null)
  const [clueCount, setClueCount] = useState<number>(0)
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState<number | null>(null)
  const [seatingBonusAvailable, setSeatingBonusAvailable] = useState(false)
  const [seatingGuess, setSeatingGuess] = useState<Record<number, CharacterId>>({})
  const [submittingSeating, setSubmittingSeating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [quizDone, setQuizDone] = useState(false)

  const [culprit, setCulprit] = useState<CharacterId | null>(null)
  const [deceasedCharacter, setDeceasedCharacter] = useState<CharacterId | null>(null)
  const [culpritGuess, setCulpritGuess] = useState<CharacterId | null>(null)
  const [deathGuess, setDeathGuess] = useState<CharacterId | 'none' | null>(null)
  const [truthGuess, setTruthGuess] = useState<boolean | null>(null)
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
        setEndingId(data.ending ?? run?.ending ?? 'F0')
        setEndingTrigger(data.endingTrigger ?? null)
        setClueCount(data.discoveredCluesCount ?? run?.discoveredClues?.length ?? 0)
        setScore(data.score ?? null)
        setSeatingBonusAvailable(Boolean(data.seatingBonusAvailable))
        setRecap(data.recap ?? [])
        setChronology(data.chronology ?? [])
        setRelationshipMatrix(data.relationshipMatrix ?? {})
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

  const ending = ENDING_SUMMARIES[(endingId ?? 'F0') as keyof typeof ENDING_SUMMARIES] ?? ENDING_SUMMARIES.F0
  const seatingComplete = SEAT_IDS.every((seat) => seatingGuess[seat])

  // Le dossier final se lit comme un document : un seul style de titre de
  // section et de paragraphe, réutilisés partout, plutôt qu'une mise en
  // forme différente par widget.
  const sectionHeadingStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-4)', fontWeight: 500,
  }
  const paragraphStyle: React.CSSProperties = {
    fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.85,
  }

  const playerLastCharacter = povHistory.length > 0 ? CHARACTERS.find((c) => c.id === povHistory[povHistory.length - 1]) : null
  const playerOwnRelations = playerLastCharacter ? relationshipMatrix[playerLastCharacter.id] : null

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
      position: 'relative',
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 'var(--space-16) var(--space-8)',
      overflow: 'hidden',
    }}>
      {/* Détail discret, tiré de la photo d'accueil — presque invisible, jamais expliqué */}
      <img
        src="/images/skeleton-hand.png"
        alt=""
        aria-hidden
        style={{
          position: 'absolute',
          top: '-15px',
          left: '-15px',
          width: 140,
          opacity: 0.45,
          filter: 'grayscale(0.2)',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
      <div style={{ width: '100%', maxWidth: 'var(--content-narrow)' }}>

        {error && (
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-error)',
            padding: 'var(--space-3) var(--space-4)', background: 'var(--color-error-highlight)',
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

            <div style={{ marginBottom: 'var(--space-10)' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text)', marginBottom: 'var(--space-3)' }}>
                Selon vous, la vérité va-t-elle finir par sortir de cette maison ?
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                <button
                  onClick={() => setTruthGuess(true)}
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    background: truthGuess === true ? 'var(--color-primary-highlight)' : 'var(--color-surface)',
                    border: `1px solid ${truthGuess === true ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                    color: truthGuess === true ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  Oui, elle sort
                </button>
                <button
                  onClick={() => setTruthGuess(false)}
                  style={{
                    padding: 'var(--space-2) var(--space-4)',
                    background: truthGuess === false ? 'var(--color-surface-offset)' : 'var(--color-surface)',
                    border: `1px solid ${truthGuess === false ? 'var(--color-text-muted)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                    color: truthGuess === false ? 'var(--color-text)' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                  }}
                >
                  Non, elle reste enterrée
                </button>
              </div>
            </div>

            <button
              onClick={() => setRevealed(true)}
              disabled={!culpritGuess || !deathGuess || truthGuess === null}
              style={{
                padding: 'var(--space-3) var(--space-8)',
                background: 'var(--color-primary)',
                color: 'var(--color-text-inverse)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                letterSpacing: '0.04em',
                cursor: culpritGuess && deathGuess && truthGuess !== null ? 'pointer' : 'not-allowed',
                opacity: culpritGuess && deathGuess && truthGuess !== null ? 1 : 0.5,
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
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-2)', lineHeight: 1.7 }}>
              {(deathGuess === 'none' ? deceasedCharacter === null : deathGuess === deceasedCharacter) ? '✓ ' : '✗ '}
              {deceasedCharacter
                ? `Vous ${deathGuess === deceasedCharacter ? 'aviez' : 'n\'aviez pas'} deviné que ${CHARACTERS.find((c) => c.id === deceasedCharacter)?.firstName} n'allait pas survivre.`
                : `Vous ${deathGuess === 'none' ? 'aviez' : 'n\'aviez pas'} deviné que tout le monde allait s'en sortir.`}
            </p>
            {truthGuess !== null && (
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
                {truthGuess === (endingId === 'F7') ? '✓ ' : '✗ '}
                Vous {truthGuess === (endingId === 'F7') ? 'aviez' : 'n\'aviez pas'} deviné que la vérité allait {endingId === 'F7' ? 'finir par sortir' : 'rester enterrée'}.
              </p>
            )}
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
          L&apos;issue de cette nuit-là
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
          marginBottom: 'var(--space-6)',
        }}>
          {ending.short}
        </p>

        {/* Récit détaillé de la fin */}
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--color-text-muted)',
          lineHeight: '1.9',
          marginBottom: endingTrigger ? 'var(--space-4)' : 'var(--space-12)',
        }}>
          {ending.detail}
        </p>

        {/* Pourquoi cette fin — la matrice de déclenchement, en version lisible */}
        {endingTrigger && (
          <div style={{
            marginBottom: 'var(--space-12)',
            paddingLeft: 'var(--space-4)',
            borderLeft: '2px solid var(--color-divider)',
          }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-faint)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              marginBottom: 'var(--space-2)',
            }}>
              Pourquoi cette fin
            </p>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-faint)',
              fontStyle: 'italic',
              lineHeight: '1.7',
            }}>
              {endingTrigger}
            </p>
          </div>
        )}

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
                Score, ce que vous avez vraiment compris
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text)' }}>
                {score}<span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)' }}>/100</span>
              </p>
            </div>
          )}
        </div>

        {/* Le bilan de compréhension — donne un but explicite : pas juste
            "vous avez trouvé X indices", mais "qu'avez-vous compris". Le
            reste du rapport (bilan, chronologie, relations…) n'apparaît
            qu'une fois ce cap franchi. */}
        {!quizDone && (
          <EndingQuiz
            endingId={endingId ?? 'F0'}
            recap={recap}
            clueCount={clueCount}
            onDone={() => setQuizDone(true)}
          />
        )}

        {quizDone && (
        <>
        {/* Le dossier complet — un seul document qu'on lit du début à la
            fin, plutôt qu'une série de cartes disjointes. Chaque section
            garde son en-tête pour se repérer, mais le contenu reste du
            texte suivi : c'est un rapport, pas un tableau de bord. */}
        <div style={{ marginBottom: 'var(--space-16)' }}>

          {/* Ce qui s'est passé — prévu / réel / dit, en paragraphes successifs plutôt qu'en 3 colonnes */}
          {report && (
            <section style={{ marginBottom: 'var(--space-10)' }}>
              <h2 style={sectionHeadingStyle}>Ce qui s&apos;est passé</h2>
              {(['planned', 'actual', 'narrated'] as const).map((col) => (
                <p key={col} style={{ ...paragraphStyle, marginBottom: 'var(--space-4)' }}>
                  <strong style={{ color: 'var(--color-primary)', fontStyle: 'normal' }}>
                    {col === 'planned' ? 'Ce qui était prévu. ' : col === 'actual' ? 'Ce qui s’est réellement passé. ' : 'Ce qui a été raconté. '}
                  </strong>
                  {reportParagraph(col, report[col])}
                </p>
              ))}
            </section>
          )}

          {/* Bilan de la soirée */}
          {epilogue && (
            <section style={{ marginBottom: 'var(--space-10)' }}>
              <h2 style={sectionHeadingStyle}>Bilan de la soirée</h2>
              <p style={{ ...paragraphStyle, fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-lg)', color: 'var(--color-text)', marginBottom: 'var(--space-3)' }}>
                {epilogue.headline}
              </p>
              <p style={{ ...paragraphStyle, marginBottom: 'var(--space-4)' }}>
                {epilogue.paragraph}
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', lineHeight: 1.8 }}>
                {epilogue.statuses.map((s, i, arr) => {
                  const character = CHARACTERS.find((c) => c.id === s.character)
                  const cond = CONDITION_LABELS[s.condition]
                  return (
                    <span key={s.character} title={s.detail}>
                      <span style={{ color: character?.color ?? 'var(--color-text-faint)' }}>{character?.firstName ?? s.character}</span>
                      {' '}<span style={{ color: cond.color }}>({cond.label.toLowerCase()})</span>
                      {i < arr.length - 1 ? ' · ' : ''}
                    </span>
                  )
                })}
              </p>
            </section>
          )}

          {/* Moments marquants */}
          {recap.length > 0 && (
            <section style={{ marginBottom: 'var(--space-10)' }}>
              <h2 style={sectionHeadingStyle}>Moments marquants</h2>
              <p style={paragraphStyle}>
                {recap.join(' ')}
              </p>
            </section>
          )}

          {/* Le contexte */}
          {chronology.length > 0 && (
            <section style={{ marginBottom: 'var(--space-10)' }}>
              <h2 style={sectionHeadingStyle}>Le contexte, sept ans, six fractures</h2>
              {chronology.map((phase) => (
                <p key={phase.id} style={{ ...paragraphStyle, marginBottom: 'var(--space-3)' }}>
                  <strong style={{ color: 'var(--color-text)', fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>
                    {phase.label}
                  </strong>
                  <span style={{ fontSize: '10px', color: 'var(--color-text-faint)' }}> · {phase.period}. </span>
                  {phase.text}
                </p>
              ))}
            </section>
          )}

          {/* Ce que votre personnage ressentait — juste le sien, pas la matrice complète (déjà vue en jeu, chapitre par chapitre) */}
          {playerOwnRelations && (
            <section style={{ marginBottom: 'var(--space-10)' }}>
              <h2 style={sectionHeadingStyle}>Ce que {playerLastCharacter?.firstName} ressentait vraiment</h2>
              <p style={paragraphStyle}>
                {CHARACTERS.filter((to) => to.id !== playerLastCharacter?.id).map((to, i, arr) => {
                  const rel = playerOwnRelations[to.id]
                  if (!rel) return null
                  return (
                    <span key={to.id}>
                      envers {to.firstName}, {relationshipLabel(rel.value)}{rel.note ? ` (${rel.note})` : ''}{i < arr.length - 1 ? ' ; ' : '.'}
                    </span>
                  )
                })}
              </p>
            </section>
          )}

          {/* Bonus optionnel — reconstituer le plan de table du moment critique */}
          {seatingBonusAvailable && (
            <section style={{ marginBottom: 'var(--space-10)' }}>
              <h2 style={sectionHeadingStyle}>Bonus, +15 points possibles</h2>
              <p style={{ ...paragraphStyle, fontStyle: 'italic', marginBottom: 'var(--space-4)' }}>
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
            </section>
          )}

          {/* Ma vérité — un paragraphe par personnage joué, dans l'ordre des chapitres */}
          {povSummaries.length > 0 && (
            <section style={{ marginBottom: 'var(--space-10)' }}>
              <h2 style={sectionHeadingStyle}>Ma vérité</h2>
              <p style={{ ...paragraphStyle, fontStyle: 'italic', marginBottom: 'var(--space-5)' }}>
                Voici, dans l&apos;ordre, les choix qui ont façonné ce que vous avez vécu cette nuit-là.
              </p>
              {povSummaries.map((s) => {
                const character = CHARACTERS.find((c) => c.id === s.character)
                const labels = s.choiceLabels
                const choiceText = labels.length === 0
                  ? "n'a pas eu l'occasion de choisir."
                  : labels.length === 1
                    ? `a choisi de ${lowerFirst(labels[0])}.`
                    : `a choisi de ${labels.slice(0, -1).map(lowerFirst).join(', ')} et de ${lowerFirst(labels[labels.length - 1])}.`
                return (
                  <p key={s.chapterNumber} style={{ ...paragraphStyle, marginBottom: 'var(--space-4)' }}>
                    <strong style={{ color: character?.color ?? 'var(--color-text)', fontStyle: 'italic', fontFamily: 'var(--font-display)' }}>
                      {character?.firstName ?? s.character}
                    </strong>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-faint)' }}> (chapitre {s.chapterNumber}, {s.chapterTitle}) </span>
                    {choiceText}
                  </p>
                )
              })}
            </section>
          )}

          {/* Le manuscrit — uniquement ce qui a été réellement établi. Ce qui
              n'a pas été débloqué ne s'affiche pas ici, même en teaser flouté :
              à ce stade (fin de partie), le montrer spoilerait la prochaine
              partie avec un autre point de vue plutôt que de donner envie d'y
              revenir. */}
          {manuscript.length > 0 && (
            <section style={{ marginBottom: 'var(--space-10)' }}>
              <h2 style={sectionHeadingStyle}>
                Le manuscrit, {manuscript.filter((e) => e.status === 'complete').length} / {manuscript.length} vérités établies
              </h2>
              {manuscript.some((e) => e.status === 'complete') ? (
                <p style={{ ...paragraphStyle, fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>
                  {manuscript.filter((e) => e.status === 'complete').map((e) => e.text).join(' ')}
                </p>
              ) : (
                <p style={{ ...paragraphStyle, fontStyle: 'italic', color: 'var(--color-text-faint)' }}>
                  Aucune vérité établie cette fois-ci. Rien à montrer que vous n&apos;ayez pas vous-même découvert.
                </p>
              )}
            </section>
          )}

          {/* Teaser de rejouabilité — sans spoiler, juste avant le bouton */}
          {povHistory.length > 0 && (() => {
            const unplayed = CHARACTERS.filter((c) => !povHistory.includes(c.id))
            if (unplayed.length === 0) return null
            return (
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', fontStyle: 'italic',
                color: 'var(--color-text-faint)',
              }}>
                {unplayed.map((c) => c.firstName).join(' et ')} n&apos;{unplayed.length > 1 ? 'ont' : 'a'} pas pris la parole cette fois-ci. Ce qu&apos;{unplayed.length > 1 ? 'ils ont' : 'elle a'} vu reste à découvrir.
              </p>
            )
          })()}
        </div>
        </>
        )}

        {/* CTA rejouer — toujours accessible, même sans avoir terminé le bilan */}
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
          {ending.lastLine}
        </p>
        </>
        )}

      </div>
    </main>
  )
}
