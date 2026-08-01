'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { db } from '@/lib/firebase/client'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useAuthStore } from '@/store/authStore'
import achievementsData from '@/data/achievements.json'
import storyBlocksData from '@/data/story_blocks.json'
import cluesData from '@/data/clues.json'

type Achievement = typeof achievementsData[0]
type StoryBlock = typeof storyBlocksData[0]

const TIER_LABEL: Record<number, string> = {
  1: 'Première soirée',
  2: 'Témoin actif',
  3: 'Reconstitution',
  4: 'Vérité complète',
}

const CHAR_COLORS: Record<string, string> = {
  maelys: '#8b1a1a',
  noe:    '#3b2f1e',
  ines:   '#1e2f3b',
  lucas:  '#1e3b2f',
  sarah:  '#3b1e2f',
  yanis:  '#2f2f1e',
}

const CHAR_LABELS: Record<string, string> = {
  maelys: 'Maëlys',
  noe:    'Noé',
  ines:   'Inès',
  lucas:  'Lucas',
  sarah:  'Sarah',
  yanis:  'Yanis',
}

const ENDING_LABELS: Record<string, string> = {
  F0: 'Ambulance',
  F1: 'La cible atteinte',
  F2: 'La mauvaise personne',
  F3: 'Le faux coupable crédible',
  F4: 'Le silence collectif',
  F5: 'La vérité trop tard',
  F6: 'Noé survit, Sarah détruite',
  F7: 'Vérité complète post-hôpital',
  F8: 'Fin noire',
  D1: 'Double victime',
  D2: 'L\'auto-contamination',
  S1: 'L\'interruption',
}

export default function CarnetPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [runs, setRuns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'parties' | 'secrets' | 'succes' | 'histoire'>('parties')
  const [openBlock, setOpenBlock] = useState<string | null>(null)

  useEffect(() => {
    if (!user) { router.push('/login'); return }
    // Un seul filtre d'égalité (playerId — le champ réellement écrit par
    // /api/run/new et /api/run/[runId]/advance, jamais "userId") : le tri
    // et le filtre "terminé" se font ensuite côté client, pour ne pas
    // dépendre d'un index composite Firestore qui n'existe pas. Même
    // logique que /api/run/current.
    const q = query(collection(db, 'runs'), where('playerId', '==', user.uid))
    getDocs(q).then((snap) => {
      const completed = snap.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .filter((r: any) => r.isComplete)
        .sort((a: any, b: any) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
      setRuns(completed)
      setLoading(false)
    })
  }, [user, router])

  // ── Calcul des succès débloqués ──────────────────────────────────────────
  const allCluesFound = new Set(runs.flatMap((r) => (r.discoveredClues ?? []).map((dc: any) => dc.clueId)))
  const allFlags = Object.assign({}, ...runs.map((r) => r.flags ?? {}))
  const allPovs = new Set(runs.map((r) => r.playerPov))
  const allEndings = new Set(runs.map((r) => r.ending))
  const maxScore = Math.max(0, ...runs.map((r) => r.finalScore ?? 0))

  function isUnlocked(ach: Achievement): boolean {
    const c = ach.condition as any
    if (c.type === 'runs_completed') return runs.length >= c.min
    if (c.type === 'unique_povs_used') return allPovs.size >= c.min
    if (c.type === 'clue_found_any_run') return allCluesFound.has(c.clueId)
    if (c.type === 'flag_set_any_run') return !!allFlags[c.flag]
    if (c.type === 'pov_completed') return allPovs.has(c.pov)
    if (c.type === 'pov_ending_with_flag_absent') {
      return runs.some((r) => r.playerPov === c.pov && !r.flags?.[c.flag])
    }
    if (c.type === 'ending_reached') return allEndings.has(c.endingId)
    if (c.type === 'all_endings_reached') return c.endingIds.every((id: string) => allEndings.has(id))
    if (c.type === 'final_score_gte') return maxScore >= c.score
    return false
  }

  const unlockedAchIds = new Set(achievementsData.filter(isUnlocked).map((a) => a.id))
  const unlockedStoryIds = new Set(
    achievementsData.filter((a) => isUnlocked(a) && a.revealsStoryBlock).map((a) => a.revealsStoryBlock!)
  )

  const cluesMeta = Object.fromEntries(cluesData.map((c) => [c.ref, c]))

  // ── Styles partagés ──────────────────────────────────────────────────────
  const card = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '8px',
    padding: '16px 20px',
  } as const

  const tab = (active: boolean) => ({
    padding: '8px 18px',
    background: active ? '#8b1a1a' : 'transparent',
    color: active ? '#f5f3ee' : 'rgba(212,207,200,0.5)',
    border: active ? 'none' : '1px solid rgba(255,255,255,0.08)',
    borderRadius: '6px',
    fontFamily: 'var(--font-body)',
    fontSize: '13px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
  })

  if (loading) return (
    <main style={{ minHeight: '100dvh', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: 'rgba(212,207,200,0.4)', fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Chargement du carnet…</p>
    </main>
  )

  return (
    <main style={{ minHeight: '100dvh', background: 'var(--color-bg)', padding: '40px 24px 80px', maxWidth: '860px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <Link href="/dashboard" style={{ color: 'rgba(212,207,200,0.4)', fontFamily: 'var(--font-body)', fontSize: '12px', letterSpacing: '0.1em', textDecoration: 'none', textTransform: 'uppercase', display: 'block', marginBottom: '24px' }}>← Retour</Link>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3.2rem)', color: '#f5f3ee', fontWeight: 400, fontStyle: 'italic', margin: 0 }}>Le Carnet</h1>
        <p style={{ color: 'rgba(212,207,200,0.5)', fontFamily: 'var(--font-body)', fontSize: '13px', marginTop: '8px' }}>
          {runs.length} partie{runs.length !== 1 ? 's' : ''} terminée{runs.length !== 1 ? 's' : ''} · {unlockedAchIds.size}/{achievementsData.length} succès · {unlockedStoryIds.size}/{storyBlocksData.length} fragments d'histoire
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {(['parties', 'secrets', 'succes', 'histoire'] as const).map((t) => (
          <button key={t} style={tab(activeTab === t)} onClick={() => setActiveTab(t)}>
            {t === 'parties' ? '📋 Parties' : t === 'secrets' ? '🔍 Secrets' : t === 'succes' ? '🏆 Succès' : '📖 Histoire'}
          </button>
        ))}
      </div>

      {/* ── PARTIES ──────────────────────────────── */}
      {activeTab === 'parties' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {runs.length === 0 && (
            <p style={{ color: 'rgba(212,207,200,0.4)', fontFamily: 'var(--font-body)', fontSize: '13px' }}>Aucune partie terminée pour l'instant.</p>
          )}
          {runs.map((run, i) => (
            <div key={run.id} style={{ ...card, borderLeft: `3px solid ${CHAR_COLORS[run.playerPov] ?? '#8b1a1a'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '17px', color: '#f5f3ee', fontStyle: 'italic' }}>
                    Partie {runs.length - i}
                  </span>
                  <span style={{ marginLeft: '12px', fontFamily: 'var(--font-body)', fontSize: '11px', color: 'rgba(212,207,200,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {run.updatedAt ? new Date(run.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ background: CHAR_COLORS[run.playerPov] ?? '#8b1a1a', color: '#f5f3ee', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontFamily: 'var(--font-body)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                    {CHAR_LABELS[run.playerPov] ?? run.playerPov}
                  </span>
                  <span style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(212,207,200,0.7)', padding: '3px 10px', borderRadius: '4px', fontSize: '11px', fontFamily: 'var(--font-body)' }}>
                    {ENDING_LABELS[run.ending] ?? run.ending ?? '—'}
                  </span>
                  {run.finalScore != null && (
                    <span style={{ color: run.finalScore >= 75 ? '#c8a96e' : 'rgba(212,207,200,0.5)', fontSize: '12px', fontFamily: 'var(--font-body)' }}>
                      {run.finalScore}/100
                    </span>
                  )}
                </div>
              </div>
              {/* Indices trouvés */}
              {(run.discoveredClues ?? []).length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <p style={{ color: 'rgba(212,207,200,0.35)', fontSize: '10px', fontFamily: 'var(--font-body)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '8px' }}>
                    {run.discoveredClues.length} indice{run.discoveredClues.length > 1 ? 's' : ''} trouvé{run.discoveredClues.length > 1 ? 's' : ''}
                  </p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {run.discoveredClues.map((dc: any) => {
                      const meta = cluesMeta[dc.clueId]
                      return (
                        <span key={dc.clueId} title={meta?.label ?? dc.clueId} style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'rgba(212,207,200,0.6)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontFamily: 'var(--font-body)',
                          letterSpacing: '0.06em',
                        }}>
                          {dc.clueId}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── SECRETS ──────────────────────────────── */}
      {activeTab === 'secrets' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ color: 'rgba(212,207,200,0.4)', fontFamily: 'var(--font-body)', fontSize: '12px', marginBottom: '8px' }}>
            {allCluesFound.size}/25 indices découverts toutes parties confondues
          </p>
          {cluesData.map((clue) => {
            const found = allCluesFound.has(clue.ref)
            return (
              <div key={clue.ref} style={{ ...card, opacity: found ? 1 : 0.35, borderLeft: `3px solid ${found ? '#8b1a1a' : 'rgba(255,255,255,0.06)'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'rgba(212,207,200,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{clue.ref}</span>
                    <p style={{ color: found ? '#f5f3ee' : 'rgba(212,207,200,0.4)', fontFamily: 'var(--font-body)', fontSize: '13px', margin: '4px 0 0' }}>
                      {found ? clue.label : '???'}
                    </p>
                    {found && (
                      <p style={{ color: 'rgba(212,207,200,0.45)', fontFamily: 'var(--font-body)', fontSize: '11px', margin: '4px 0 0', fontStyle: 'italic' }}>
                        {clue.where}
                      </p>
                    )}
                  </div>
                  <span style={{
                    padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontFamily: 'var(--font-body)', letterSpacing: '0.06em', textTransform: 'uppercase',
                    background: clue.reliability === 'tres_haute' ? 'rgba(200,169,110,0.15)' : clue.reliability === 'haute' ? 'rgba(139,26,26,0.2)' : 'rgba(255,255,255,0.04)',
                    color: clue.reliability === 'tres_haute' ? '#c8a96e' : clue.reliability === 'haute' ? '#e07070' : 'rgba(212,207,200,0.4)',
                  }}>
                    {found ? clue.reliability.replace('_', ' ') : '—'}
                  </span>
                </div>
                {found && (
                  <p style={{ color: 'rgba(212,207,200,0.4)', fontFamily: 'var(--font-body)', fontSize: '11px', margin: '10px 0 0', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                    <em>Prouve : </em>{clue.proves}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ── SUCCÈS ──────────────────────────────── */}
      {activeTab === 'succes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {[1, 2, 3, 4].map((tier) => (
            <div key={tier}>
              <p style={{ color: 'rgba(212,207,200,0.3)', fontFamily: 'var(--font-body)', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '12px' }}>
                {TIER_LABEL[tier]}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {achievementsData.filter((a) => a.tier === tier).map((ach) => {
                  const unlocked = unlockedAchIds.has(ach.id)
                  return (
                    <div key={ach.id} style={{ ...card, opacity: unlocked ? 1 : 0.4, display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '24px', flexShrink: 0, filter: unlocked ? 'none' : 'grayscale(1)' }}>{ach.icon}</span>
                      <div>
                        <p style={{ color: unlocked ? '#f5f3ee' : 'rgba(212,207,200,0.4)', fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 600, margin: 0 }}>
                          {unlocked ? ach.title : '???'}
                        </p>
                        <p style={{ color: 'rgba(212,207,200,0.45)', fontFamily: 'var(--font-body)', fontSize: '12px', margin: '4px 0 0' }}>
                          {unlocked ? ach.description : 'Non débloqué'}
                        </p>
                        {unlocked && ach.revealsStoryBlock && (
                          <p style={{ color: '#c8a96e', fontFamily: 'var(--font-body)', fontSize: '11px', margin: '6px 0 0', letterSpacing: '0.06em' }}>
                            ✦ Fragment d'histoire débloqué
                          </p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── HISTOIRE ──────────────────────────────── */}
      {activeTab === 'histoire' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ color: 'rgba(212,207,200,0.4)', fontFamily: 'var(--font-body)', fontSize: '12px', marginBottom: '8px' }}>
            {unlockedStoryIds.size}/{storyBlocksData.length} fragments débloqués
          </p>
          {storyBlocksData.map((block) => {
            const unlocked = unlockedStoryIds.has(block.id)
            const isOpen = openBlock === block.id
            return (
              <div key={block.id} style={{ ...card, opacity: unlocked ? 1 : 0.3, cursor: unlocked ? 'pointer' : 'default' }}
                onClick={() => unlocked && setOpenBlock(isOpen ? null : block.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ color: unlocked ? '#f5f3ee' : 'rgba(212,207,200,0.3)', fontFamily: 'var(--font-display)', fontSize: '16px', fontStyle: 'italic', margin: 0 }}>
                    {unlocked ? block.title : '— Fragment verrouillé —'}
                  </p>
                  {unlocked && (
                    <span style={{ color: 'rgba(212,207,200,0.4)', fontSize: '12px' }}>{isOpen ? '▲' : '▼'}</span>
                  )}
                </div>
                {unlocked && !isOpen && (
                  <p style={{ color: 'rgba(212,207,200,0.3)', fontFamily: 'var(--font-body)', fontSize: '11px', margin: '6px 0 0', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                    Débloqué via : {achievementsData.find((a) => a.revealsStoryBlock === block.id)?.title ?? '—'}
                  </p>
                )}
                {unlocked && isOpen && (
                  <p style={{ color: 'rgba(212,207,200,0.75)', fontFamily: 'var(--font-body)', fontSize: '13px', lineHeight: 1.8, margin: '14px 0 0', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px' }}>
                    {block.text}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}

    </main>
  )
}
