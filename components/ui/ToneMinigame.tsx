'use client'

/**
 * ToneMinigame — Scène 3 : lire la vraie tonalité sous les mots.
 * Six moments observables sont possibles (bible, chapitre 8) ; chaque
 * personnage n'en voit que 3, et jamais celui où il est lui-même l'acteur
 * (on ne se demande pas ce que son propre sous-texte signifie). Le jeu
 * varie donc selon qui est joué, pas seulement selon la scène — rejouer
 * avec un autre personnage au chapitre 1 donne un vrai mini-jeu différent.
 * Bien lire la pièce apaise un peu la tension ambiante ; mal la lire
 * l'alimente — cohérent avec socialTension qui pilote déjà les fins.
 */

import { useState, useMemo } from 'react'
import type { CharacterId } from '@/lib/types/characters'

interface ToneItem {
  speaker: CharacterId
  line: string
  options: string[]
  correctIndex: number
}

const MOMENTS: Record<string, ToneItem> = {
  noe_depasses: {
    speaker: 'noe',
    line: '« On a tous été un peu dépassés. »',
    options: [
      'Une observation neutre sur la soirée',
      'Une diversion — dit pour ne pas en dire plus',
      'Une blague qui tombe à plat',
    ],
    correctIndex: 1,
  },
  maelys_tu_as_raison: {
    speaker: 'maelys',
    line: '« Tu as raison. » — en réponse à Inès, sur la maison',
    options: [
      'Elle est vraiment d’accord, soulagée',
      'Elle coupe court, pour fermer le sujet net',
      'Elle se moque d’Inès',
    ],
    correctIndex: 1,
  },
  yanis_rire_seul: {
    speaker: 'yanis',
    line: 'Il rit, seul, à sa propre blague sur « un dîner ou une réunion »',
    options: [
      'Il détend vraiment l’ambiance',
      'Il ne voit pas que personne d’autre ne rit',
      'Il cherche à provoquer Inès',
    ],
    correctIndex: 1,
  },
  sarah_sourire_couteux: {
    speaker: 'sarah',
    line: 'Elle arrive la dernière, avec un sourire qui lui coûte quelque chose.',
    options: [
      'Elle est simplement fatiguée',
      'Elle tient quelque chose ensemble, et ça lui demande un effort réel',
      'Elle est agacée d’être là',
    ],
    correctIndex: 1,
  },
  maelys_remercie: {
    speaker: 'maelys',
    line: 'Face à une pique d’Inès sur la vente, elle remercie plutôt que de répondre.',
    options: [
      'Elle apprécie sincèrement la remarque',
      'Elle déstabilise plus par ce détour que par une vraie réponse',
      'Elle n’a pas entendu la pique',
    ],
    correctIndex: 1,
  },
  ines_chiffres: {
    speaker: 'ines',
    line: '« La maison a toujours été à son nom, ce n’est pas une opinion. » — chiffres à l’appui',
    options: [
      'Elle énonce un fait, sans arrière-pensée',
      'Elle teste, pour voir si quelqu’un va la contredire',
      'Elle plaisante pour détendre l’ambiance',
    ],
    correctIndex: 1,
  },
}

// Chaque personnage voit 3 des 6 moments — jamais le sien.
const ITEMS_BY_CHARACTER: Record<CharacterId, string[]> = {
  maelys: ['noe_depasses', 'yanis_rire_seul', 'ines_chiffres'],
  noe:    ['maelys_tu_as_raison', 'yanis_rire_seul', 'ines_chiffres'],
  ines:   ['noe_depasses', 'maelys_tu_as_raison', 'maelys_remercie'],
  lucas:  ['noe_depasses', 'maelys_tu_as_raison', 'sarah_sourire_couteux'],
  sarah:  ['maelys_tu_as_raison', 'yanis_rire_seul', 'maelys_remercie'],
  yanis:  ['noe_depasses', 'maelys_remercie', 'ines_chiffres'],
}

const LABELS: Record<CharacterId, string> = {
  maelys: 'Maëlys', noe: 'Noé', ines: 'Inès', lucas: 'Lucas', sarah: 'Sarah', yanis: 'Yanis',
}

interface ToneMinigameProps {
  playerPov: CharacterId
  onComplete: (result: { correctCount: number; total: number }) => void
}

export function ToneMinigame({ playerPov, onComplete }: ToneMinigameProps) {
  const ITEMS = useMemo(
    () => ITEMS_BY_CHARACTER[playerPov].map((key) => MOMENTS[key]),
    [playerPov]
  )
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
