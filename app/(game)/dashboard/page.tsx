'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CharacterCard, CHARACTERS } from '@/components/ui/CharacterCard'
import { DeducedSeatingPlan } from '@/components/ui/DeducedSeatingPlan'
import { ImageSlot } from '@/components/ui/ImageSlot'
import { TOTAL_CHAPTERS, getChapterNumberForScene } from '@/lib/engine/chapters'
import { getCharacterAction, formatCharacterAction } from '@/lib/engine/characterActions'
import { getManuscriptStatus, getEmptyManuscriptStatus } from '@/lib/engine/manuscript'
import { getDeducedSeating } from '@/lib/engine/deducedSeating'
import type { CharacterId } from '@/lib/types/characters'
import type { RunState } from '@/lib/types/engine'

const CHARACTER_NAMES: Record<CharacterId, string> = {
  maelys: 'Maëlys', noe: 'Noé', ines: 'Inès', lucas: 'Lucas', sarah: 'Sarah', yanis: 'Yanis',
}

type ExistingRun = RunState & { id: string }

function ManuscriptCarnet({ manuscript }: { manuscript: ReturnType<typeof getEmptyManuscriptStatus> }) {
  const complete = manuscript.filter((e) => e.status === 'complete').length
  return (
    <div>
      <p style={{
        fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-faint)',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-3)',
      }}>
        🕵️ Manuscrit de la soirée — {complete} / {manuscript.length} vérités établies
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
        {manuscript.map((e) => (
          <p key={e.id} style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)',
            color: e.status === 'complete' ? 'var(--color-text-muted)' : 'var(--color-text-faint)',
            fontStyle: e.status === 'complete' ? 'normal' : 'italic',
            lineHeight: 1.5,
            filter: e.status === 'locked' ? 'blur(3px)' : 'none',
            userSelect: e.status === 'locked' ? 'none' : 'auto',
          }}>
            {e.status === 'complete' ? '✓ ' : e.status === 'partial' ? '· ' : '— '}{e.text}
          </p>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<CharacterId | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCharacterSelect, setShowCharacterSelect] = useState(false)

  const [existingRun, setExistingRun] = useState<ExistingRun | null>(null)
  const [checkingExisting, setCheckingExisting] = useState(true)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const [resetting, setResetting] = useState(false)

  useEffect(() => {
    fetch('/api/run/current')
      .then(async (res) => {
        if (!res.ok) return
        const data = await res.json()
        setExistingRun(data.run ?? null)
      })
      .catch(() => {})
      .finally(() => setCheckingExisting(false))
  }, [])

  async function handleResetSave() {
    if (!existingRun || resetting) return
    setResetting(true)
    setError(null)
    try {
      const res = await fetch(`/api/run/${existingRun.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Impossible de supprimer la sauvegarde')
      setExistingRun(null)
      setConfirmingReset(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setResetting(false)
    }
  }

  async function handleStart() {
    if (!selected || loading) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/run/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ character: selected }),
      })
      if (!res.ok) {
        const data = await res.json()
        if (res.status === 401) { router.push('/login?next=/dashboard'); return }
        throw new Error(data.error ?? 'Erreur serveur')
      }
      const { runId } = await res.json()
      router.push(`/run/${runId}`)
    } catch (err: unknown) {
      setError((err as Error).message)
      setLoading(false)
    }
  }

  const selectedChar = CHARACTERS.find((c) => c.id === selected)
  const manuscript = existingRun ? getManuscriptStatus(existingRun) : getEmptyManuscriptStatus()
  const deducedSeats = getDeducedSeating(existingRun)

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
      {/* En-tête */}
      <header
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 'var(--content-wide)',
          textAlign: 'center',
          marginBottom: 'var(--space-10)',
          padding: 'var(--space-8) var(--space-6)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          isolation: 'isolate',
        }}
      >
        {/* Image d'accueil — voir docs/prompts-visuels.md / images-manifest.md. N'occupe aucun espace tant qu'elle n'existe pas. */}
        <div aria-hidden style={{ position: 'absolute', inset: 0, zIndex: -1 }}>
          <ImageSlot src="/images/hero-accueil.jpg" alt="" scrim />
        </div>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-faint)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            marginBottom: 'var(--space-4)',
          }}
        >
          Sous la nappe
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-2xl)',
            color: 'var(--color-text)',
            fontWeight: 400,
            fontStyle: 'italic',
            marginBottom: 'var(--space-4)',
          }}
        >
          Ce que vous savez de cette soirée
        </h1>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-faint)',
            maxWidth: '48ch',
            margin: '0 auto',
            lineHeight: 1.7,
          }}
        >
          {existingRun
            ? 'Le carnet et le plan de table se complètent au fil de la partie.'
            : 'Rien n’est encore écrit. Choisissez un point de vue pour commencer.'}
        </p>
      </header>

      {/* ── Entrée vers le Carnet (parties passées, succès, secrets, histoire) ── */}
      <Link
        href="/carnet"
        style={{
          width: '100%', maxWidth: 'var(--content-narrow)',
          padding: 'var(--space-4) var(--space-6)',
          marginBottom: 'var(--space-8)',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-divider)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-4)',
          textDecoration: 'none',
          transition: 'border-color var(--transition), background var(--transition)',
        }}
      >
        <div>
          <p style={{
            fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', fontStyle: 'italic',
            color: 'var(--color-text)', margin: 0,
          }}>
            📓 Le carnet
          </p>
          <p style={{
            fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)',
            margin: 'var(--space-1) 0 0',
          }}>
            Vos parties passées (à revoir ou à effacer), les indices trouvés, les succès et les fragments d'histoire débloqués.
          </p>
        </div>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-lg)', color: 'var(--color-text-faint)', flexShrink: 0 }}>→</span>
      </Link>

      {!checkingExisting && (
        <>
          {/* ── Manuscrit + plan de table déduit — seulement s'il y a une partie en cours à raconter. Vide, tout ça n'est que du texte flouté qui gêne le lancement d'une nouvelle soirée. ── */}
          {existingRun && (
            <div style={{
              width: '100%', maxWidth: 'var(--content-narrow)',
              padding: 'var(--space-6)',
              marginBottom: 'var(--space-8)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-divider)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex', flexDirection: 'column', gap: 'var(--space-6)',
            }}>
              <ManuscriptCarnet manuscript={manuscript} />
              <div style={{ paddingTop: 'var(--space-5)', borderTop: '1px solid var(--color-divider)' }}>
                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-faint)',
                  textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 'var(--space-3)',
                }}>
                  🍽️ Plan de table reconstitué
                </p>
                <DeducedSeatingPlan seats={deducedSeats} />
              </div>
            </div>
          )}

          {/* ── Partie en cours — reprendre ou recommencer à zéro ── */}
          {existingRun && (
            <div style={{
              width: '100%', maxWidth: 'var(--content-narrow)',
              padding: 'var(--space-6)',
              marginBottom: 'var(--space-10)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-divider)',
              borderRadius: 'var(--radius-lg)',
            }}>
              <p style={{
                fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text-faint)',
                textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 'var(--space-3)',
              }}>
                Une soirée est déjà en cours
              </p>
              <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginBottom: 'var(--space-5)', lineHeight: 1.6 }}>
                Chapitre {getChapterNumberForScene(existingRun.currentScene) ?? 1} / {TOTAL_CHAPTERS} · vous incarniez {CHARACTER_NAMES[existingRun.playerPov]}.
                {(existingRun.povHistory?.length ?? 0) > 1 && ` Déjà incarné : ${existingRun.povHistory.map((c) => CHARACTER_NAMES[c]).join(', ')}.`}
              </p>

              {!confirmingReset ? (
                <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => router.push(`/run/${existingRun.id}`)}
                    style={{
                      padding: 'var(--space-3) var(--space-6)', background: 'var(--color-primary)',
                      color: 'var(--color-text-inverse)', border: 'none', borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', letterSpacing: '0.04em', cursor: 'pointer',
                    }}
                  >
                    ▶ Reprendre la partie
                  </button>
                  <button
                    onClick={() => setConfirmingReset(true)}
                    style={{
                      padding: 'var(--space-3) var(--space-6)', background: 'transparent',
                      color: 'var(--color-text-faint)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                      fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', letterSpacing: '0.04em', cursor: 'pointer',
                    }}
                  >
                    🗑 Effacer cette sauvegarde
                  </button>
                </div>
              ) : (
                <div>
                  <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-error)', marginBottom: 'var(--space-4)' }}>
                    Cette action efface définitivement la progression actuelle. Confirmer ?
                  </p>
                  <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                    <button
                      onClick={handleResetSave}
                      disabled={resetting}
                      style={{
                        padding: 'var(--space-3) var(--space-6)', background: 'var(--color-error, #a01f1f)',
                        color: '#fff', border: 'none', borderRadius: 'var(--radius-md)',
                        fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', letterSpacing: '0.04em',
                        cursor: resetting ? 'wait' : 'pointer', opacity: resetting ? 0.7 : 1,
                      }}
                    >
                      {resetting ? 'Suppression…' : '🗑 Oui, tout effacer'}
                    </button>
                    <button
                      onClick={() => setConfirmingReset(false)}
                      disabled={resetting}
                      style={{
                        padding: 'var(--space-3) var(--space-6)', background: 'transparent',
                        color: 'var(--color-text-muted)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)',
                        fontFamily: 'var(--font-body)', fontSize: 'var(--text-sm)', letterSpacing: '0.04em', cursor: 'pointer',
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}
              {error && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-error)', marginTop: 'var(--space-4)' }}>
                  {error}
                </p>
              )}
            </div>
          )}

          {/* ── Pas de partie en cours : CTA pour révéler la sélection de personnage ── */}
          {!existingRun && !showCharacterSelect && (
            <button
              onClick={() => setShowCharacterSelect(true)}
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
                marginBottom: 'var(--space-12)',
              }}
            >
              🎭 Commencer une nouvelle soirée →
            </button>
          )}

          {/* ── Grille de cartes — sélection de personnage ── */}
          {!existingRun && showCharacterSelect && (
          <>
          <div
            style={{
              width: '100%',
              maxWidth: 'var(--content-wide)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))',
              gap: 'var(--space-4)',
              marginBottom: 'var(--space-12)',
            }}
          >
            {CHARACTERS.map((c) => (
              <CharacterCard
                key={c.id}
                character={c}
                isSelected={selected === c.id}
                onClick={() => setSelected((prev) => (prev === c.id ? null : c.id))}
                accrocheOverride={formatCharacterAction(getCharacterAction(c.id, 1, 0))}
              />
            ))}
          </div>

          {/* Bandeau bas fixe — apparaît quand un perso est sélectionné */}
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              padding: 'var(--space-4) var(--space-8)',
              background: 'var(--color-surface)',
              borderTop: '1px solid var(--color-divider)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 'var(--space-4)',
              transform: selected ? 'translateY(0)' : 'translateY(100%)',
              transition: 'transform 240ms cubic-bezier(0.16, 1, 0.3, 1)',
              zIndex: 10,
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
              {selectedChar && (
                <>
                  <p
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 'var(--text-lg)',
                      color: selectedChar.color,
                      fontStyle: 'italic',
                      lineHeight: 1,
                    }}
                  >
                    {selectedChar.firstName}
                  </p>
                  <p
                    style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: 'var(--text-xs)',
                      color: 'var(--color-text-faint)',
                    }}
                  >
                    {formatCharacterAction(getCharacterAction(selectedChar.id, 1, 0))}
                  </p>
                </>
              )}
              {error && (
                <p style={{ fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-error)' }}>
                  {error}
                </p>
              )}
            </div>

            <button
              onClick={handleStart}
              disabled={loading || !selected}
              style={{
                flexShrink: 0,
                padding: 'var(--space-3) var(--space-8)',
                background: selectedChar ? selectedChar.color : 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                letterSpacing: '0.04em',
                cursor: loading ? 'wait' : 'pointer',
                opacity: loading ? 0.7 : 1,
                transition: 'all var(--transition)',
              }}
            >
              {loading ? 'Chargement…' : '🎭 Jouer ce rôle →'}
            </button>
          </div>
          </>
          )}
        </>
      )}
    </main>
  )
}
