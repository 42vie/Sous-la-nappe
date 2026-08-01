'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CHARACTERS } from '@/components/ui/CharacterCard'
import { CardCarousel } from '@/components/ui/CardCarousel'
import { CHAPTERS, TOTAL_CHAPTERS } from '@/lib/engine/chapters'
import { BLIND_SPOTS } from '@/lib/engine/blindSpots'
import { CHARACTER_BIOS, CHRONOLOGY, RELATIONSHIP_MATRIX, relationshipLabel } from '@/lib/engine/backstory'
import { getManuscriptStatus } from '@/lib/engine/manuscript'
import type { CharacterId } from '@/lib/types/characters'
import type { RunState } from '@/lib/types/engine'

const CHARACTER_NAMES: Record<CharacterId, string> = {
  maelys: 'Maëlys Renaud',
  noe:    'Noé Varnier',
  ines:   'Inès Varnier',
  lucas:  'Lucas Berthier',
  sarah:  'Sarah Kessler',
  yanis:  'Yanis Amrani',
}

export default function ChapterSelectPage() {
  const params = useParams()
  const router = useRouter()
  const runId = params.runId as string

  const [run, setLocalRun] = useState<RunState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!runId) return
    fetch(`/api/run/${runId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Run introuvable')
        const data = await res.json() as RunState
        setLocalRun(data)
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erreur inconnue'))
      .finally(() => setLoading(false))
  }, [runId])

  const povHistory = run?.povHistory ?? (run ? [run.playerPov] : [])
  const nextChapterNumber = povHistory.length + 1
  const chapter = CHAPTERS[nextChapterNumber - 1]
  const justPlayed = povHistory[povHistory.length - 1]
  const justPlayedName = justPlayed ? CHARACTER_NAMES[justPlayed].split(' ')[0] : null
  const blindSpots = justPlayed ? BLIND_SPOTS[justPlayed] : []
  const justPlayedBio = justPlayed ? CHARACTER_BIOS[justPlayed] : null
  const justPlayedRelations = justPlayed ? RELATIONSHIP_MATRIX[justPlayed] : null
  const tension = run?.variable?.socialTension ?? 0
  // La chronologie (7 ans, 6 fractures) se débloque progressivement, jamais
  // d'un coup — la phase 4 (l'invalidation, le vrai mobile) n'arrive qu'une
  // fois qu'on a déjà vu une bonne partie de la soirée.
  const unlockedPhases = povHistory.length <= 1 ? 2 : povHistory.length === 2 ? 3 : 5
  const chronology = CHRONOLOGY.slice(0, unlockedPhases)
  const manuscript = run ? getManuscriptStatus(run) : []
  const truthsEstablished = manuscript.filter((e) => e.status === 'complete').length
  const cluesFound = run?.discoveredClues?.length ?? 0

  // Tous les chapitres ont déjà un personnage : rien à choisir, retour au run.
  useEffect(() => {
    if (run && nextChapterNumber > TOTAL_CHAPTERS) {
      router.replace(`/run/${runId}`)
    }
  }, [run, nextChapterNumber, runId, router])

  if (loading || !run) {
    return (
      <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)', fontStyle: 'italic' }}>
          Chargement…
        </p>
      </main>
    )
  }

  // Les blocs de contexte (stats, bio, angles morts, chronologie) sont
  // regroupés en cartes défilables plutôt qu'empilés verticalement — voir
  // CardCarousel. Chaque carte garde son fond/bordure propre ; c'est le
  // carrousel qui gère largeur et espacement.
  const cardStyle: React.CSSProperties = {
    padding: 'var(--space-5) var(--space-6)',
    background: 'var(--color-surface)',
    border: '1px solid var(--color-divider)',
    borderRadius: 'var(--radius-lg)',
    height: '100%',
  }

  const cards: { key: string; content: React.ReactNode }[] = []

  if (povHistory.length > 0) {
    cards.push({
      key: 'stats',
      content: (
        <div style={cardStyle}>
          <div style={{ display: 'flex', gap: 'var(--space-8)', marginBottom: 'var(--space-4)' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                Vérités établies
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-text)' }}>
                {truthsEstablished}<span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)' }}>/{manuscript.length}</span>
              </p>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                Indices trouvés
              </p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', color: 'var(--color-text)' }}>
                {cluesFound}<span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)' }}>/25</span>
              </p>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                Tension dans la maison
              </p>
              <div style={{ height: 6, background: 'var(--color-surface-offset)', borderRadius: 999, overflow: 'hidden', marginTop: 'var(--space-2)' }}>
                <div style={{
                  height: '100%', width: `${tension}%`,
                  background: tension >= 65 ? 'var(--color-error, #a01f1f)' : 'var(--color-primary)',
                  transition: 'width 300ms ease',
                }} />
              </div>
            </div>
          </div>

          {manuscript.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--color-divider)' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '2px' }}>
                Le carnet
              </p>
              {manuscript.map((e) => (
                <p key={e.id} style={{
                  fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
                  color: e.status === 'complete' ? 'var(--color-text-muted)' : 'var(--color-text-faint)',
                  filter: e.status === 'locked' ? 'blur(3px)' : 'none',
                  userSelect: e.status === 'locked' ? 'none' : 'auto',
                  fontStyle: e.status === 'complete' ? 'normal' : 'italic',
                  lineHeight: 1.5,
                }}>
                  {e.status === 'complete' ? '✓ ' : e.status === 'partial' ? '· ' : '— '}{e.text}
                </p>
              ))}
            </div>
          )}
        </div>
      ),
    })
  }

  if (justPlayedName && justPlayedBio) {
    cards.push({
      key: 'bio',
      content: (
        <div style={cardStyle}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-3)',
          }}>
            Qui est {justPlayedName} — {justPlayedBio.role}, {justPlayedBio.age} ans
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              {justPlayedBio.identity}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--color-text)' }}>La blessure. </strong>{justPlayedBio.wound}
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
              <strong style={{ color: 'var(--color-text)' }}>Ce que {justPlayedName === 'Sarah' || justPlayedName === 'Maëlys' || justPlayedName === 'Inès' ? 'elle' : 'il'} veut, ce soir. </strong>{justPlayedBio.wants}
            </p>
          </div>

          {justPlayedRelations && (
            <div style={{ marginTop: 'var(--space-5)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--color-divider)' }}>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-faint)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-3)' }}>
                Ce que {justPlayedName} ressent, envers chacun
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                {CHARACTERS.filter((c) => c.id !== justPlayed).map((c) => {
                  const rel = justPlayedRelations[c.id]
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
                      <div style={{ height: 4, background: 'var(--color-surface-offset)', borderRadius: 999, overflow: 'hidden', position: 'relative' }}>
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
        </div>
      ),
    })
  }

  if (justPlayedName && blindSpots.length > 0) {
    cards.push({
      key: 'blindspots',
      content: (
        <div style={cardStyle}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-3)',
          }}>
            Ce que {justPlayedName} n&apos;a jamais vu, ce soir-là
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {blindSpots.map((spot, i) => (
              <p key={i} style={{
                fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)',
                fontStyle: 'italic', lineHeight: 1.6,
              }}>
                — {spot}
              </p>
            ))}
          </div>
        </div>
      ),
    })
  }

  if (chronology.length > 0) {
    cards.push({
      key: 'chronology',
      content: (
        <div style={cardStyle}>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-4)',
          }}>
            Le contexte — {chronology.length} / {CHRONOLOGY.length} fractures connues
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {chronology.map((phase) => (
              <div key={phase.id}>
                <p style={{
                  fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: 'var(--text-sm)',
                  color: 'var(--color-text)', marginBottom: 'var(--space-1)',
                }}>
                  {phase.label} <span style={{ fontFamily: 'var(--font-body)', fontStyle: 'normal', fontSize: '10px', color: 'var(--color-text-faint)' }}>· {phase.period}</span>
                </p>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', lineHeight: 1.7 }}>
                  {phase.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      ),
    })
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'var(--space-16) var(--space-8) var(--space-24)',
      }}
    >
      <header style={{ width: '100%', maxWidth: 'var(--content-wide)', textAlign: 'center', marginBottom: 'var(--space-10)' }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)',
          textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 'var(--space-4)',
        }}>
          Chapitre {nextChapterNumber} / {TOTAL_CHAPTERS}
        </p>
        <h1 style={{
          fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', color: 'var(--color-text)',
          fontWeight: 400, fontStyle: 'italic', marginBottom: 'var(--space-4)',
        }}>
          {chapter?.title ?? '—'}
        </h1>
        {povHistory.length > 0 && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)' }}>
            Déjà incarné : {povHistory.map((c) => CHARACTER_NAMES[c].split(' ')[0]).join(', ')}
          </p>
        )}
        {error && (
          <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-error)', marginTop: 'var(--space-4)' }}>
            {error}
          </p>
        )}
      </header>

      {/* Ce qu'on sait déjà — carrousel de cartes plutôt qu'un long scroll : stats, bio du perso qu'on vient de jouer, ses angles morts, la chronologie du passé */}
      {cards.length > 0 && (
        <div style={{ width: '100%', maxWidth: 'var(--content-wide)', marginBottom: 'var(--space-10)' }}>
          <CardCarousel cards={cards} />
        </div>
      )}

      <Link
        href={`/run/${runId}/chapter/select`}
        style={{
          display: 'inline-block',
          padding: 'var(--space-3) var(--space-8)',
          background: 'var(--color-primary)',
          color: 'var(--color-text-inverse)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          letterSpacing: '0.04em',
          textDecoration: 'none',
          marginBottom: 'var(--space-12)',
        }}
      >
        🎭 Choisir le prochain point de vue →
      </Link>
    </main>
  )
}
