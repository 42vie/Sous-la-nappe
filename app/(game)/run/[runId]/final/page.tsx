'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useRunStore } from '@/store/runStore'

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

export default function FinalPage() {
  const params = useParams()
  const router = useRouter()
  const runId = params.runId as string
  const { run } = useRunStore()

  const [report, setReport] = useState<FinalReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState<number | null>(null)

  useEffect(() => {
    if (!runId) return
    fetch(`/api/run/${runId}/final`)
      .then(async (res) => {
        if (!res.ok) return
        const data = await res.json()
        setReport(data.report ?? null)
        setScore(data.score ?? null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [runId])

  const endingId = run?.ending ?? 'F1'
  const ending = ENDING_LABELS[endingId] ?? ENDING_LABELS.F1

  const clueCount = run?.discoveredClues?.length ?? 0

  return (
    <main style={{
      minHeight: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 'var(--space-16) var(--space-8)',
    }}>
      <div style={{ width: '100%', maxWidth: 'var(--content-narrow)' }}>

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
                        {key}
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

        {/* CTA rejouer */}
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

      </div>
    </main>
  )
}
