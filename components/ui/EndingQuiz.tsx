'use client'

// Le bilan de fin — donne un but explicite au joueur : pas juste "vous avez
// trouvé X indices", mais "qu'avez-vous vraiment compris de ce qui s'est
// passé". Basé sur data/endings_questionnaire.json (10 questions, dont 2
// contextuelles selon la fin obtenue — les fins F9+ n'existent pas encore
// dans le moteur, ces questions resteront simplement filtrées jusque-là).
//
// Trois temps, jamais mélangés (une info à la fois) :
//   1. Rapide rappel de ce qui a été découvert cette partie (le joueur relit
//      avant de répondre, pas de piège de mémoire gratuit)
//   2. Les questions, une par une
//   3. Le résultat : une note qualitative + un plan de table symbolique
//      généré depuis les réponses, pas depuis l'état réel du jeu
import { useState } from 'react'
import questionnaireRaw from '@/data/endings_questionnaire.json'
import { CHARACTERS } from './CharacterCard'
import type { CharacterId } from '@/lib/types/characters'

interface QuizOption {
  id: string
  text: string
  points: number
  correct?: boolean
  penaltyIfChecked?: number
  clueRef?: string
}

interface QuizQuestion {
  id: string
  order: number
  type: 'choix_unique' | 'choix_multiple' | 'slider'
  text: string
  availableFor: 'all' | string[]
  options?: QuizOption[]
  revealIfWrong?: string
  minLabel?: string
  maxLabel?: string
  min?: number
  max?: number
  points?: number
}

interface QuizData {
  questions: QuizQuestion[]
  scoring: {
    totalMax: number
    grades: { min: number; max: number; label: string; description: string }[]
  }
  seatingResult: {
    layouts: Record<string, { seats: { position: number; character: CharacterId; note: string }[] }>
  }
}

const QUIZ: QuizData = (questionnaireRaw as unknown as QuizData[])[0]

interface EndingQuizProps {
  endingId: string
  recap: string[]
  clueCount: number
  onDone: () => void
}

type Step = 'recap' | number | 'results'

export function EndingQuiz({ endingId, recap, clueCount, onDone }: EndingQuizProps) {
  const questions = QUIZ.questions.filter(
    (q) => q.availableFor === 'all' || (q.availableFor as string[]).includes(endingId)
  )

  const [step, setStep] = useState<Step>('recap')
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [sliderValue, setSliderValue] = useState<Record<string, number>>({})

  const questionIndex = typeof step === 'number' ? step : -1
  const question = questionIndex >= 0 ? questions[questionIndex] : null

  function selectSingle(qId: string, optId: string) {
    setAnswers((a) => ({ ...a, [qId]: [optId] }))
  }

  function toggleMultiple(qId: string, optId: string) {
    setAnswers((a) => {
      const current = a[qId] ?? []
      const next = current.includes(optId) ? current.filter((x) => x !== optId) : [...current, optId]
      return { ...a, [qId]: next }
    })
  }

  function goNext() {
    if (questionIndex < questions.length - 1) {
      setStep(questionIndex + 1)
    } else {
      setStep('results')
    }
  }

  function canContinue(): boolean {
    if (!question) return false
    if (question.type === 'slider') return true
    return (answers[question.id]?.length ?? 0) > 0
  }

  // --- Scoring ---
  let score = 0
  for (const q of questions) {
    if (q.type === 'slider') {
      score += q.points ?? 0
      continue
    }
    const picked = answers[q.id] ?? []
    for (const optId of picked) {
      const opt = q.options?.find((o) => o.id === optId)
      if (!opt) continue
      score += opt.correct === false ? (opt.penaltyIfChecked ?? 0) : opt.points
    }
  }
  score = Math.max(0, Math.min(QUIZ.scoring.totalMax, score))
  const grade = QUIZ.scoring.grades.find((g) => score >= g.min && score <= g.max) ?? QUIZ.scoring.grades[QUIZ.scoring.grades.length - 1]

  // --- Plan de table symbolique ---
  const q1 = answers['Q1']?.[0]
  const q4 = answers['Q4']?.[0]
  const q5 = answers['Q5'] ?? []
  const q7 = sliderValue['Q7'] ?? 50
  let layoutKey = 'seating_base'
  if (q1 === 'Q1a' && q4 === 'Q4b') layoutKey = 'seating_joueur_lucide'
  else if (q1 === 'Q1b' && q5.includes('Q5b')) layoutKey = 'seating_joueur_noe_coupable'
  else if (q1 === 'Q1c') layoutKey = 'seating_joueur_collectif'
  else if (q7 < 30) layoutKey = 'seating_joueur_fataliste'
  const layout = QUIZ.seatingResult.layouts[layoutKey]

  if (step === 'recap') {
    return (
      <div style={{
        marginBottom: 'var(--space-12)',
        padding: 'var(--space-6)',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-divider)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-4)',
        }}>
          Avant le bilan — ce que vous savez déjà
        </p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-4)', lineHeight: 1.7 }}>
          Vous avez trouvé <strong style={{ color: 'var(--color-text)' }}>{clueCount} indice{clueCount > 1 ? 's' : ''}</strong> cette partie.
          {recap.length > 0 ? ' Relisez ce que vous avez vu avant de répondre :' : ' Peu de choses ont attiré votre attention cette fois-ci.'}
        </p>
        {recap.length > 0 && (
          <ul style={{ margin: '0 0 var(--space-6)', paddingLeft: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {recap.map((line, i) => (
              <li key={i} style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                {line}
              </li>
            ))}
          </ul>
        )}
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', fontStyle: 'italic', marginBottom: 'var(--space-6)' }}>
          {questions.length} questions vont maintenant tester ce que vous avez vraiment compris — pas seulement ce que vous avez vu.
        </p>
        <button
          onClick={() => setStep(0)}
          style={{
            padding: 'var(--space-3) var(--space-8)', background: 'var(--color-primary)',
            color: 'var(--color-text-inverse)', border: 'none', borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', letterSpacing: '0.04em', cursor: 'pointer',
          }}
        >
          Commencer le bilan →
        </button>
      </div>
    )
  }

  if (question) {
    const picked = answers[question.id] ?? []
    return (
      <div style={{
        marginBottom: 'var(--space-12)',
        padding: 'var(--space-6)',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-divider)',
        borderRadius: 'var(--radius-lg)',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-faint)',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-4)',
        }}>
          Question {questionIndex + 1} / {questions.length}
        </p>
        <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-lg)', color: 'var(--color-text)', marginBottom: 'var(--space-5)', lineHeight: 1.5 }}>
          {question.text}
        </p>

        {question.type === 'slider' ? (
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <input
              type="range"
              min={question.min ?? 0}
              max={question.max ?? 100}
              value={sliderValue[question.id] ?? 50}
              onChange={(e) => setSliderValue((v) => ({ ...v, [question.id]: Number(e.target.value) }))}
              style={{ width: '100%', marginBottom: 'var(--space-2)' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-faint)' }}>{question.minLabel}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-faint)' }}>{question.maxLabel}</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-6)' }}>
            {question.options?.map((opt) => {
              const isPicked = picked.includes(opt.id)
              return (
                <button
                  key={opt.id}
                  onClick={() => question.type === 'choix_multiple' ? toggleMultiple(question.id, opt.id) : selectSingle(question.id, opt.id)}
                  style={{
                    textAlign: 'left',
                    padding: 'var(--space-3) var(--space-4)',
                    background: isPicked ? 'var(--color-primary-highlight)' : 'var(--color-surface-offset)',
                    border: `1px solid ${isPicked ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    borderRadius: 'var(--radius-md)',
                    fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)',
                    color: isPicked ? 'var(--color-primary)' : 'var(--color-text-muted)',
                    cursor: 'pointer',
                    transition: 'all var(--transition)',
                  }}
                >
                  {opt.text}
                </button>
              )
            })}
          </div>
        )}

        <button
          onClick={goNext}
          disabled={!canContinue()}
          style={{
            padding: 'var(--space-3) var(--space-8)',
            background: canContinue() ? 'var(--color-primary)' : 'var(--color-surface-offset)',
            color: canContinue() ? 'var(--color-text-inverse)' : 'var(--color-text-faint)',
            border: 'none', borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', letterSpacing: '0.04em',
            cursor: canContinue() ? 'pointer' : 'not-allowed',
          }}
        >
          {questionIndex < questions.length - 1 ? 'Suivant →' : 'Voir le résultat →'}
        </button>
      </div>
    )
  }

  // --- Résultats ---
  return (
    <div style={{
      marginBottom: 'var(--space-12)',
      padding: 'var(--space-6)',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-divider)',
      borderRadius: 'var(--radius-lg)',
    }}>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-3)',
      }}>
        Ce que vous avez compris
      </p>
      <p style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-xl)', color: 'var(--color-text)', marginBottom: 'var(--space-3)' }}>
        {grade.label}
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7, marginBottom: 'var(--space-4)' }}>
        {grade.description}
      </p>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text)', marginBottom: 'var(--space-8)' }}>
        {score}<span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)' }}>/{QUIZ.scoring.totalMax}</span>
      </p>

      {layout && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-3)',
          }}>
            Le plan de table selon vos réponses
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
            {layout.seats.map((seat) => {
              const character = CHARACTERS.find((c) => c.id === seat.character)
              return (
                <div key={seat.position} style={{
                  padding: 'var(--space-2) var(--space-3)',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${character?.color ?? 'var(--color-border)'}30`,
                  background: 'var(--color-surface-offset)',
                }}>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: character?.color ?? 'var(--color-text)', marginBottom: seat.note ? '2px' : 0 }}>
                    {character?.firstName ?? seat.character}
                  </p>
                  {seat.note && (
                    <p style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--color-text-faint)', lineHeight: 1.3 }}>
                      {seat.note}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <button
        onClick={onDone}
        style={{
          padding: 'var(--space-3) var(--space-8)', background: 'var(--color-primary)',
          color: 'var(--color-text-inverse)', border: 'none', borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', letterSpacing: '0.04em', cursor: 'pointer',
        }}
      >
        Voir le reste du bilan →
      </button>
    </div>
  )
}
