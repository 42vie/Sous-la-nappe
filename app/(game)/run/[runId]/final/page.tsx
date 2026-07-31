'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import type { CharacterId } from '@/lib/types/characters'

// —————————————————————————————————————————————————————————————
// Types locaux (sous-ensemble de FinalScreenData)
// —————————————————————————————————————————————————————————————
interface RunFinal {
  id: string
  playerCharacter: CharacterId
  discoveredClues: string[]
  flags: Record<string, boolean | number | string>
  sceneChoices: Record<string, string>
  isComplete: boolean
}

interface Column {
  label: string
  who: string
  why: string
  mechanism: string
  whoKnew: string
  finalSentence: string
}

// —————————————————————————————————————————————————————————————
// Résolution des 3 colonnes à partir de l'état du run
// —————————————————————————————————————————————————————————————
function resolveColumns(run: RunFinal): { planned: Column; actual: Column; narrated: Column; lastLine: string } {
  const f = run.flags
  const ch = run.sceneChoices

  // ---- COLONNE 1 : CE QUI ÉTAIT PRÉVU ----
  const planned: Column = {
    label: 'Ce qui était prévu',
    who: 'Noé Varnier',
    why: 'La maison. La dette. L’humiliation publique.',
    mechanism: f['maelys_preuves_financieres']
      ? 'Poison dans l’assiette de Noé, vecteur préparé à l’avance.'
      : 'Vecteur préparé, méthode non identifiée.',
    whoKnew: f['lucas_savait_dettes']
      ? 'Lucas savait. Il n’a rien dit ce soir-là.'
      : 'Personne ne savait — ou personne ne l’a dit.',
    finalSentence: 'Maëlys avait répété la scène. Le plan était précis.',
  }

  // ---- COLONNE 2 : CE QUI S'EST PASSÉ ----
  // Déterminé par les choix du joueur (qui a aidé au service, qui s'est assis où)
  const helpedService = ch['scene_08_critical_service'] === 'c8_help_service'
  const witnessSpoke  = f['spoke_incident']
  const interruptedKitchen = f['interrupted_kitchen']

  let actualWho = 'Sarah Kessler'
  let actualWhy = 'Elle n’a pas pris son traitement. L’assiette n’était pas la sienne.'
  let actualMechanism = helpedService
    ? 'Le vecteur a été redistribué lors du service. Sarah était à la mauvaise place.'
    : 'L’assiette de Noé a atteint Sarah. Le plan de table a dévié au dernier moment.'

  if (interruptedKitchen) {
    actualMechanism = 'L’interruption en cuisine a altéré la séquence. Sarah a reçu le vecteur par erreur.'
  }

  const actual: Column = {
    label: 'Ce qui s’est passé',
    who: actualWho,
    why: actualWhy,
    mechanism: actualMechanism,
    whoKnew: witnessSpoke
      ? 'Quelqu’un a parlé — mais pas assez tôt.'
      : 'Lucas a vu. Il s’est tu. Il est le seul à le savoir.',
    finalSentence: 'La cible prévue n’a pas été atteinte. La victime était à côté.',
  }

  // ---- COLONNE 3 : CE QUI S'EST DIT ----
  // Basée sur les choix narratifs du joueur
  const silentIncident = f['silent_incident']
  const noeSpoke       = ch['scene_10_aftermath'] === 'c10_narrative'
  const lucasReveal    = ch['scene_10_aftermath'] === 'c10_clue_c20'
  const sarahRemember  = ch['scene_10_aftermath'] === 'c10_clue_c14'

  let narratedWho = 'Personne en particulier'
  let narratedWhy = 'Un accident. Un malaise. Ça arrive.'
  let narratedMechanism = 'La version collective a émergé sans qu’on la décide.'

  if (lucasReveal) {
    narratedWho = 'Lucas Berthier'
    narratedWhy = 'Il a sorti le vocal. La vérité avait une voix.'
    narratedMechanism = 'Le message de Maëlys a été entendu. Le groupe a dû choisir ce qu’il en faisait.'
  } else if (noeSpoke) {
    narratedWho = 'Noé Varnier'
    narratedWhy = 'Il a cadre le récit avant que quelqu’un d’autre le fasse.'
    narratedMechanism = 'Trois phrases dans l’ordre. La version de Noé est devenue la version du groupe.'
  } else if (sarahRemember) {
    narratedWho = 'Sarah Kessler'
    narratedWhy = 'Elle s’est souvenue d’une phrase. Personne ne l’a crue.'
    narratedMechanism = 'Le souvenir était juste. L’attention ne l’était pas.'
  } else if (silentIncident) {
    narratedMechanism = 'Le silence a été la décision du groupe. La version officielle est le vide.'
  }

  const narrated: Column = {
    label: 'Ce qui s’est dit',
    who: narratedWho,
    why: narratedWhy,
    mechanism: narratedMechanism,
    whoKnew: f['sarah_silence_coupable']
      ? 'Sarah savait quelque chose. Elle l’a tu toute la soirée.'
      : 'La vérité n’a pas de porte-parole.',
    finalSentence: 'Ce qui se dit une fois devient la vérité. Ce qui se tait n’a jamais existé.',
  }

  // Dernière ligne — selon le POV
  const povLastLines: Record<CharacterId, string> = {
    maelys: 'Elle a rangé les assiettes. Elle a éteint les lumières. Elle a attendu.',
    noe:    'Il a construit une version. Il y a cru suffisamment longtemps.',
    ines:   'Elle avait vu juste depuis le début. Elle n’avait pas les mots pour le dire.',
    lucas:  'Il avait tout. Il a choisi de garder ça pour lui. Il ne sait pas encore si c’était une erreur.',
    sarah:  'Il y a un moment avant et un moment après. Ce qui s’est passé entre les deux, elle ne le saura jamais.',
    yanis:  'La photo est horodatée. Il ne sait pas encore ce qu’elle prouve.',
  }

  const lastLine = povLastLines[run.playerCharacter]

  return { planned, actual, narrated, lastLine }
}

// Score (0–100) selon les indices découverts et les choix clés
function computeScore(run: RunFinal): number {
  const HIGH_VALUE_CLUES = ['C-09', 'C-11', 'C-15', 'C-18', 'C-19', 'C-22']
  const clueScore = run.discoveredClues.filter(c => HIGH_VALUE_CLUES.includes(c)).length // 0–6

  const spoke = run.flags['spoke_incident'] ? 1 : 0
  const noSilence = run.flags['stayed_silent_game2'] ? 0 : 1
  const watchedMaelys = run.flags['watching_maelys'] ? 1 : 0

  const raw = (clueScore / 6) * 60 + spoke * 15 + noSilence * 10 + watchedMaelys * 15
  return Math.min(100, Math.round(raw))
}

function scoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Luée', color: 'var(--color-success)' }
  if (score >= 55) return { label: 'Partielle', color: 'var(--color-warning)' }
  if (score >= 30) return { label: 'Fragmentée', color: 'var(--color-orange)' }
  return { label: 'Aveugle', color: 'var(--color-error)' }
}

// —————————————————————————————————————————————————————————————
// Composant
// —————————————————————————————————————————————————————————————
function FinalColumn({ col, delay }: { col: Column; delay: number }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-4)',
        padding: 'var(--space-6)',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        animationDelay: `${delay}ms`,
      }}
    >
      {/* Label colonne */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-faint)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
      }}>
        {col.label}
      </p>

      {/* Qui */}
      <div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginBottom: 'var(--space-1)' }}>Qui</p>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--color-text)', fontStyle: 'italic' }}>{col.who}</p>
      </div>

      <div style={{ width: '100%', height: '1px', background: 'var(--color-divider)' }} />

      {/* Pourquoi */}
      <div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginBottom: 'var(--space-2)' }}>Pourquoi</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{col.why}</p>
      </div>

      {/* Mécanisme */}
      <div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginBottom: 'var(--space-2)' }}>Comment</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{col.mechanism}</p>
      </div>

      {/* Qui savait */}
      <div>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginBottom: 'var(--space-2)' }}>Qui savait</p>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{col.whoKnew}</p>
      </div>

      <div style={{ width: '100%', height: '1px', background: 'var(--color-divider)' }} />

      {/* Phrase finale */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-faint)',
        fontStyle: 'italic',
        lineHeight: 1.7,
      }}>
        {col.finalSentence}
      </p>
    </div>
  )
}

export default function FinalPage() {
  const params = useParams()
  const router = useRouter()
  const runId = params.runId as string

  const [run, setRun] = useState<RunFinal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!runId) return
    // Marquer le run comme complet avant de fetch
    fetch(`/api/run/${runId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isComplete: true }),
    }).catch(() => null)

    fetch(`/api/run/${runId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Run introuvable')
        return res.json()
      })
      .then(setRun)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [runId])

  if (loading) {
    return (
      <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)', fontStyle: 'italic' }}>
          Chargement…
        </p>
      </main>
    )
  }

  if (error || !run) {
    return (
      <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-error)' }}>
          {error ?? 'Run introuvable.'}
        </p>
      </main>
    )
  }

  const { planned, actual, narrated, lastLine } = resolveColumns(run)
  const score = computeScore(run)
  const { label: scoreLabel_, color: scoreColor } = scoreLabel(score)
  const clueCount = run.discoveredClues.length

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'var(--space-12) var(--space-8) var(--space-20)',
      }}
    >
      <div style={{ width: '100%', maxWidth: 'var(--content-wide)', display: 'flex', flexDirection: 'column', gap: 'var(--space-12)' }}>

        {/* En-tête */}
        <header style={{ maxWidth: 'var(--content-narrow)' }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-faint)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: 'var(--space-4)',
          }}>
            Sous la nappe — Dénouement
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            color: 'var(--color-text)',
            fontStyle: 'italic',
            fontWeight: 400,
            lineHeight: 1.2,
            marginBottom: 'var(--space-6)',
          }}>
            Trois vérités pour une soirée
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            lineHeight: 1.8,
            maxWidth: '58ch',
          }}>
            Ce qui était prévu. Ce qui s’est passé. Ce qui s’est dit.
            Trois récits pour une seule soirée — et aucun n’est complet.
          </p>
        </header>

        {/* Score */}
        <div style={{
          display: 'flex',
          gap: 'var(--space-8)',
          alignItems: 'center',
          padding: 'var(--space-5) var(--space-6)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          maxWidth: '480px',
        }}>
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginBottom: 'var(--space-1)' }}>Lecture de la soirée</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: scoreColor, fontStyle: 'italic' }}>{scoreLabel_}</p>
          </div>
          <div style={{ width: '1px', background: 'var(--color-divider)', alignSelf: 'stretch' }} />
          <div>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)', marginBottom: 'var(--space-1)' }}>Indices trouvés</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-text)', fontStyle: 'italic' }}>{clueCount} / 15</p>
          </div>
        </div>

        {/* 3 colonnes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
          gap: 'var(--space-4)',
          alignItems: 'start',
        }}>
          <FinalColumn col={planned}  delay={0} />
          <FinalColumn col={actual}   delay={120} />
          <FinalColumn col={narrated} delay={240} />
        </div>

        {/* Dernière ligne */}
        <div style={{
          borderTop: '1px solid var(--color-divider)',
          paddingTop: 'var(--space-8)',
          maxWidth: 'var(--content-narrow)',
        }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lg)',
            color: 'var(--color-text-muted)',
            fontStyle: 'italic',
            lineHeight: 1.8,
          }}>
            &ldquo;{lastLine}&rdquo;
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: 'var(--space-3) var(--space-8)',
              background: 'var(--color-primary)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
            }}
          >
            Rejouer avec un autre personnage
          </button>
          <button
            onClick={() => router.push('/')}
            style={{
              padding: 'var(--space-3) var(--space-8)',
              background: 'none',
              color: 'var(--color-primary)',
              border: '1px solid var(--color-primary)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              cursor: 'pointer',
            }}
          >
            Retour à l’accueil
          </button>
        </div>

      </div>
    </main>
  )
}
