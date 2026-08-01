'use client'

/**
 * ToneMinigame — Scène 3 : lire la vraie tonalité sous les mots.
 * Six moments observables sont possibles (bible, chapitre 8) ; chaque
 * personnage n'en voit que 3, et jamais celui où il est lui-même l'acteur
 * (on ne se demande pas ce que son propre sous-texte signifie). Le jeu
 * varie donc selon qui est joué, pas seulement selon la scène — rejouer
 * avec un autre personnage au chapitre 1 donne un vrai mini-jeu différent.
 *
 * Il n'y a pas de bonne lecture : chaque option est une interprétation
 * plausible, pas un test de perspicacité. Ce qui varie, c'est l'effet —
 * une lecture qui cherche le sous-texte tend à calmer le joueur lui-même
 * (moins de surprise plus tard), une lecture qui prend les choses au
 * premier degré ou qui prête une intention hostile laisse la tension
 * s'accumuler sans qu'on l'ait vue venir. socialTension pilote déjà les
 * fins (F3/F4/F8) : cette interprétation y contribue directement, sans
 * jugement de "juste" ou "faux" affiché au joueur.
 */

import { useState, useMemo } from 'react'
import type { CharacterId } from '@/lib/types/characters'

interface ToneOption {
  label: string
  /** Effet sur la tension collective si cette lecture est choisie — pas un score de justesse. */
  tensionDelta: number
}

interface ToneItem {
  speaker: CharacterId
  time: string
  room: string
  line: string
  options: ToneOption[]
}

// Chaque option porte son propre effet sur la tension — pas de "bonne"
// réponse comparée à un index caché. Une lecture qui cherche le sous-texte
// (souvent l'option du milieu, mais pas une règle) calme un peu ; une
// lecture au premier degré laisse la tension s'accumuler sans qu'on la
// voie ; une lecture qui prête une intention hostile l'alimente le plus.
const MOMENTS: Record<string, ToneItem> = {
  noe_depasses: {
    speaker: 'noe',
    time: '20h18', room: 'Salon',
    line: '« On a tous été un peu dépassés. »',
    options: [
      { label: 'Une observation neutre sur la soirée', tensionDelta: 2 },
      { label: 'Une diversion — dit pour ne pas en dire plus', tensionDelta: -3 },
      { label: 'Une blague qui tombe à plat', tensionDelta: 4 },
    ],
  },
  maelys_tu_as_raison: {
    speaker: 'maelys',
    time: '20h20', room: 'Salon',
    line: '« Tu as raison. » — en réponse à Inès, sur la maison',
    options: [
      { label: 'Elle est vraiment d’accord, soulagée', tensionDelta: 2 },
      { label: 'Elle coupe court, pour fermer le sujet net', tensionDelta: -3 },
      { label: 'Elle se moque d’Inès', tensionDelta: 4 },
    ],
  },
  yanis_rire_seul: {
    speaker: 'yanis',
    time: '20h19', room: 'Salon',
    line: 'Il rit, seul, à sa propre blague sur « un dîner ou une réunion »',
    options: [
      { label: 'Il détend vraiment l’ambiance', tensionDelta: 2 },
      { label: 'Il ne voit pas que personne d’autre ne rit', tensionDelta: -3 },
      { label: 'Il cherche à provoquer Inès', tensionDelta: 4 },
    ],
  },
  sarah_sourire_couteux: {
    speaker: 'sarah',
    time: '20h14', room: 'Entrée',
    line: 'Elle arrive la dernière, avec un sourire qui lui coûte quelque chose.',
    options: [
      { label: 'Elle est simplement fatiguée', tensionDelta: 2 },
      { label: 'Elle tient quelque chose ensemble, et ça lui demande un effort réel', tensionDelta: -3 },
      { label: 'Elle est agacée d’être là', tensionDelta: 4 },
    ],
  },
  maelys_remercie: {
    speaker: 'maelys',
    time: '20h17', room: 'Salon',
    line: 'Face à une pique d’Inès sur la vente, elle remercie plutôt que de répondre.',
    options: [
      { label: 'Elle apprécie sincèrement la remarque', tensionDelta: 2 },
      { label: 'Elle déstabilise plus par ce détour que par une vraie réponse', tensionDelta: -3 },
      { label: 'Elle n’a pas entendu la pique', tensionDelta: 4 },
    ],
  },
  ines_chiffres: {
    speaker: 'ines',
    time: '20h16', room: 'Salon',
    line: '« La maison a toujours été à son nom, ce n’est pas une opinion. » — chiffres à l’appui',
    options: [
      { label: 'Elle énonce un fait, sans arrière-pensée', tensionDelta: 2 },
      { label: 'Elle teste, pour voir si quelqu’un va la contredire', tensionDelta: -3 },
      { label: 'Elle plaisante pour détendre l’ambiance', tensionDelta: 4 },
    ],
  },
  maelys_ferme_visage: {
    speaker: 'maelys',
    time: '20h18', room: 'Salon',
    line: 'Après la phrase de Noé, quelque chose se ferme, une seconde, dans son visage.',
    options: [
      { label: 'Elle est simplement fatiguée par la soirée', tensionDelta: 2 },
      { label: 'Quelque chose vient de se décider en elle, à cet instant précis', tensionDelta: -3 },
      { label: 'Elle est agacée que Noé ait pris la parole', tensionDelta: 4 },
    ],
  },
  yanis_sert_large: {
    speaker: 'yanis',
    time: '20h13', room: 'Salon',
    line: 'Il ouvre une deuxième bouteille et sert large, dès les premiers échanges.',
    options: [
      { label: 'Il est simplement généreux, comme toujours', tensionDelta: 2 },
      { label: 'Il sent que quelque chose est tendu et essaie de le noyer', tensionDelta: -3 },
      { label: 'Il veut que tout le monde soit ivre pour une raison précise', tensionDelta: 4 },
    ],
  },
  lucas_regard_sarah: {
    speaker: 'lucas',
    time: '20h15', room: 'Salon',
    line: 'Il ne quitte pas Sarah des yeux depuis qu’elle est arrivée.',
    options: [
      { label: 'Il apprécie simplement sa compagnie', tensionDelta: 2 },
      { label: 'Il a remarqué qu’elle ne va pas bien et n’ose rien dire', tensionDelta: -3 },
      { label: 'Il la surveille par méfiance', tensionDelta: 4 },
    ],
  },
}

// Chaque personnage voit 3 des 9 moments — jamais le sien. La répartition
// est pensée pour qu'aucune paire de personnages ne partage plus d'1
// question sur 3 (vérifié : maelys/yanis ne partagent qu'1 question sur 3,
// pas 2 comme dans une première version de cette répartition).
const ITEMS_BY_CHARACTER: Record<CharacterId, string[]> = {
  maelys: ['noe_depasses', 'sarah_sourire_couteux', 'lucas_regard_sarah'],
  noe:    ['yanis_rire_seul', 'ines_chiffres', 'yanis_sert_large'],
  yanis:  ['maelys_tu_as_raison', 'ines_chiffres', 'lucas_regard_sarah'],
  ines:   ['maelys_tu_as_raison', 'sarah_sourire_couteux', 'yanis_sert_large'],
  sarah:  ['noe_depasses', 'maelys_remercie', 'yanis_sert_large'],
  lucas:  ['yanis_rire_seul', 'maelys_remercie', 'maelys_ferme_visage'],
}

const LABELS: Record<CharacterId, string> = {
  maelys: 'Maëlys', noe: 'Noé', ines: 'Inès', lucas: 'Lucas', sarah: 'Sarah', yanis: 'Yanis',
}

interface ToneMinigameProps {
  playerPov: CharacterId
  onComplete: (result: { tensionDelta: number }) => void
}

export function ToneMinigame({ playerPov, onComplete }: ToneMinigameProps) {
  const ITEMS = useMemo(
    () => ITEMS_BY_CHARACTER[playerPov].map((key) => MOMENTS[key]),
    [playerPov]
  )
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [locked, setLocked] = useState(false)
  const [sent, setSent] = useState(false)

  const allAnswered = ITEMS.every((_, i) => answers[i] !== undefined)
  const totalDelta = ITEMS.reduce((sum, item, i) => {
    const chosen = answers[i]
    return chosen === undefined ? sum : sum + item.options[chosen].tensionDelta
  }, 0)

  function handleValidate() {
    if (!allAnswered) return
    setLocked(true)
  }

  function handleConfirm() {
    if (sent) return
    setSent(true)
    onComplete({ tensionDelta: totalDelta })
  }

  const readingSummary =
    totalDelta <= -3
      ? 'Ce que vous avez perçu tenait surtout du non-dit — vous avez cherché sous les phrases.'
      : totalDelta >= 6
        ? 'Vous avez surtout prêté aux autres des intentions précises, parfois hostiles.'
        : 'Un mélange de lectures — parfois au premier degré, parfois plus loin.'

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
              fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-faint)',
              textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 'var(--space-1)',
            }}>
              {item.time} · {item.room}
            </p>
            <p style={{
              fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-sm)',
              color: 'var(--color-text)', marginBottom: 'var(--space-3)',
            }}>
              {LABELS[item.speaker]} — {item.line}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {item.options.map((opt, oi) => {
                const isSelected = answers[i] === oi
                return (
                  <button
                    key={oi}
                    onClick={() => !locked && setAnswers((prev) => ({ ...prev, [i]: oi }))}
                    disabled={locked}
                    style={{
                      textAlign: 'left',
                      padding: 'var(--space-2) var(--space-3)',
                      background: isSelected ? 'var(--color-surface-offset)' : 'transparent',
                      border: `1px solid ${isSelected ? 'var(--color-text-faint)' : 'var(--color-border)'}`,
                      borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)',
                      cursor: locked ? 'default' : 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {!locked ? (
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
            textAlign: 'center', marginBottom: 'var(--space-4)', fontStyle: 'italic',
          }}>
            {readingSummary}
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
