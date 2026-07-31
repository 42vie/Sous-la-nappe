'use client'

/**
 * ToneMinigame — Scène 3 : lire la vraie tonalité sous les mots.
 * Trois répliques déjà présentes dans la narration de la scène (bible,
 * chapitre 8) — le joueur doit identifier ce qu'elles cachent vraiment.
 * Bien lire la pièce apaise un peu la tension ambiante ; mal la lire
 * l'alimente — cohérent avec socialTension qui pilote déjà les fins.
 */

import { useState } from 'react'
import type { CharacterId } from '@/lib/types/characters'

interface ToneItem {
  speaker: CharacterId
  line: string
  options: string[]
  correctIndex: number
}

const ITEMS: ToneItem[] = [
  {
    speaker: 'noe',
    line: '« On a tous été un peu dépassés. »',
    options: [
      'Une observation neutre sur la soirée',
      'Une diversion — dit pour ne pas en dire plus',
      'Une blague qui tombe à plat',
    ],
    correctIndex: 1,
  },
  {
    speaker: 'maelys',
    line: '« Tu as raison. » — en réponse à Inès, sur la maison',
    options: [
      'Elle est vraiment d’accord, soulagée',
      'Elle coupe court, pour fermer le sujet net',
      'Elle se moque d’Inès',
    ],
    correctIndex: 1,
  },
  {
    speaker: 'yanis',
    line: 'Il rit, seul, à sa propre blague sur « un dîner ou une réunion »',
    options: [
      'Il détend vraiment l’ambiance',
      'Il ne voit pas que personne d’autre ne rit',
      'Il cherche à provoquer Inès',
    ],
    correctIndex: 1,
  },
]

const LABELS: Record<CharacterId, string> = {
  maelys: 'Maëlys', noe: 'Noé', ines: 'Inès', lucas: 'Lucas', sarah: 'Sarah', yanis: 'Yanis',
}

interface ToneMinigameProps {
  onComplete: (result: { correctCount: number; total: number }) => void
}

export function ToneMinigame({ onComplete }: ToneMinigameProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [revealed, setRevealed] = useState(false)
  const [sent, setSent] = useState(false)

  const allAnswered = ITEMS.every((_, i) => answers[i] !== undefined)
  const correctCount = ITEMS.filter((item, i) => answers[i] === item.correctIndex).length

  function handleValidate() {
    if (!allAnswered) return
    setRevealed(true)
  }

  function handleConfirm() {
    if (sent) return
    setSent(true)
    onComplete({ correctCount, total: ITEMS.length })
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: 440,
      margin: '0 auto',
      padding: 'var(--space-6)',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
    }}>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)',
        textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', marginBottom: 'var(--space-2)',
      }}>
        Mini-jeu — Lire la pièce
      </p>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)',
        textAlign: 'center', marginBottom: 'var(--space-6)', fontStyle: 'italic',
      }}>
        Ce qui est dit, et ce que ça cache vraiment.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
        {ITEMS.map((item, i) => (
          <div key={i}>
            <p style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-sm)',
              color: 'var(--color-text)', marginBottom: 'var(--space-3)',
            }}>
              {LABELS[item.speaker]} — {item.line}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {item.options.map((opt, oi) => {
                const isSelected = answers[i] === oi
                const isCorrect = revealed && oi === item.correctIndex
                const isWrongSelected = revealed && isSelected && oi !== item.correctIndex
                return (
                  <button
                    key={oi}
                    onClick={() => !revealed && setAnswers((prev) => ({ ...prev, [i]: oi }))}
                    disabled={revealed}
                    style={{
                      textAlign: 'left',
                      padding: 'var(--space-2) var(--space-3)',
                      background: isCorrect
                        ? 'var(--color-primary-highlight)'
                        : isWrongSelected
                          ? 'var(--color-error-bg)'
                          : isSelected
                            ? 'var(--color-surface-offset)'
                            : 'transparent',
                      border: `1px solid ${isCorrect ? 'var(--color-primary)' : isWrongSelected ? 'var(--color-error)' : isSelected ? 'var(--color-text-faint)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)',
                      cursor: revealed ? 'default' : 'pointer',
                    }}
                  >
                    {opt}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {!revealed ? (
        <button
          onClick={handleValidate}
          disabled={!allAnswered}
          style={{
            width: '100%', padding: 'var(--space-3) var(--space-6)',
            background: 'var(--color-primary)', color: 'var(--color-text-inverse)',
            border: 'none', borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', letterSpacing: '0.04em',
            cursor: allAnswered ? 'pointer' : 'not-allowed', opacity: allAnswered ? 1 : 0.5,
          }}
        >
          Valider ma lecture
        </button>
      ) : (
        <>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text)',
            textAlign: 'center', marginBottom: 'var(--space-4)',
          }}>
            {correctCount} / {ITEMS.length} — {correctCount === ITEMS.length ? 'vous sentez tout.' : correctCount === 0 ? 'rien de tout ça ne vous a atteint.' : 'une partie du sous-texte vous échappe.'}
          </p>
          <button
            onClick={handleConfirm}
            disabled={sent}
            style={{
              width: '100%', padding: 'var(--space-3) var(--space-6)',
              background: 'var(--color-primary)', color: 'var(--color-text-inverse)',
              border: 'none', borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', letterSpacing: '0.04em',
              cursor: sent ? 'wait' : 'pointer', opacity: sent ? 0.7 : 1,
            }}
          >
            Continuer →
          </button>
        </>
      )}
    </div>
  )
}
