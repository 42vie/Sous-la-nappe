'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { CharacterCard, CHARACTERS } from '@/components/ui/CharacterCard'
import { useRunStore } from '@/store/runStore'
import { CHAPTERS, TOTAL_CHAPTERS } from '@/lib/engine/chapters'
import { BLIND_SPOTS } from '@/lib/engine/blindSpots'
import { getCharacterAction, formatCharacterAction } from '@/lib/engine/characterActions'
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
  const setRun = useRunStore((s) => s.setRun)

  const [run, setLocalRun] = useState<RunState | null>(null)
  const [selected, setSelected] = useState<CharacterId | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
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
  const available = CHARACTERS.filter((c) => !povHistory.includes(c.id))
  const justPlayed = povHistory[povHistory.length - 1]
  const justPlayedName = justPlayed ? CHARACTER_NAMES[justPlayed].split(' ')[0] : null
  const blindSpots = justPlayed ? BLIND_SPOTS[justPlayed] : []
  const tension = run?.variable?.socialTension ?? 0
  const manuscript = run ? getManuscriptStatus(run) : []
  const truthsEstablished = manuscript.filter((e) => e.status === 'complete').length
  const cluesFound = run?.discoveredClues?.length ?? 0

  // Tous les chapitres ont déjà un personnage : rien à choisir, retour au run.
  useEffect(() => {
    if (run && nextChapterNumber > TOTAL_CHAPTERS) {
      router.replace(`/run/${runId}`)
    }
  }, [run, nextChapterNumber, runId, router])

  async function handleConfirm() {
    if (!selected || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch(`/api/run/${runId}/chapter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character: selected }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Erreur serveur')
      }
      const data = await res.json()
      setRun(data.run)
      router.push(`/run/${runId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
      setSubmitting(false)
    }
  }

  if (loading || !run) {
    return (
      <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-faint)', fontStyle: 'italic' }}>
          Chargement…
        </p>
      </main>
    )
  }

  const selectedChar = available.find((c) => c.id === selected)

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

      {/* Bel accueil — résumé de ce qu'on sait déjà, avant de choisir la suite */}
      {povHistory.length > 0 && (
        <div style={{
          width: '100%', maxWidth: 'var(--content-narrow)',
          padding: 'var(--space-5) var(--space-6)',
          marginBottom: 'var(--space-8)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-divider)',
          borderRadius: 'var(--radius-lg)',
        }}>
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
      )}

      {justPlayedName && blindSpots.length > 0 && (
        <div style={{
          width: '100%', maxWidth: 'var(--content-narrow)',
          padding: 'var(--space-5) var(--space-6)',
          marginBottom: 'var(--space-10)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-divider)',
          borderRadius: 'var(--radius-lg)',
        }}>
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
      )}

      <div style={{
        width: '100%', maxWidth: 'var(--content-wide)',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))',
        gap: 'var(--space-4)', marginBottom: 'var(--space-12)',
      }}>
        {available.map((c) => (
          <CharacterCard
            key={c.id}
            character={c}
            isSelected={selected === c.id}
            onClick={() => setSelected((prev) => (prev === c.id ? null : c.id))}
            accrocheOverride={formatCharacterAction(getCharacterAction(c.id, nextChapterNumber, tension))}
          />
        ))}
      </div>

      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        padding: 'var(--space-4) var(--space-8)',
        background: 'var(--color-surface)', borderTop: '1px solid var(--color-divider)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)',
        transform: selected ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1)',
        zIndex: 10, boxShadow: 'var(--shadow-lg)',
      }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: selectedChar?.color, fontStyle: 'italic' }}>
          {selectedChar?.firstName}
        </p>
        <button
          onClick={handleConfirm}
          disabled={!selected || submitting}
          style={{
            padding: 'var(--space-3) var(--space-8)',
            background: selectedChar?.color ?? 'var(--color-primary)',
            color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', letterSpacing: '0.04em',
            cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? 'Chargement…' : `Continuer en ${selectedChar?.firstName ?? '...'} →`}
        </button>
      </div>
    </main>
  )
}
