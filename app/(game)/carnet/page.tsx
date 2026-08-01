'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import achievementsData from '@/data/achievements.json'
import storyBlocksData from '@/data/story_blocks.json'
import cluesData from '@/data/clues.json'
import { ENDING_SUMMARIES } from '@/lib/engine/endingSummaries'
import type { RunState } from '@/lib/types/engine'
import type { DiscoveredClue } from '@/lib/types/clues'
import type { CharacterId } from '@/lib/types/characters'
import type { EndingId } from '@/lib/types/endings'

type Achievement = typeof achievementsData[0]
type StoryBlock = typeof storyBlocksData[0]
/** finalScore/updatedAt sont écrits à côté du RunState (routes /final et /advance), pas dans le type du moteur. */
type CompletedRun = RunState & { id: string; updatedAt?: number; finalScore?: number }

/** Une forme par valeur de condition.type dans achievements.json — évite le "as any" sur un champ multi-forme. */
type AchievementCondition =
  | { type: 'runs_completed'; min: number }
  | { type: 'unique_povs_used'; min: number }
  | { type: 'clue_found_any_run'; clueId: string }
  | { type: 'flag_set_any_run'; flag: string }
  | { type: 'pov_completed'; pov: CharacterId }
  | { type: 'pov_ending_with_flag_absent'; pov: CharacterId; flag: string }
  | { type: 'ending_reached'; endingId: EndingId }
  | { type: 'all_endings_reached'; endingIds: EndingId[] }
  | { type: 'final_score_gte'; score: number }

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
  E1: 'Inès co-coupable',
  E2: 'Solidarité toxique',
  E3: 'Preuve effacée',
  F9: 'Justice formelle',
  F13: 'Yanis comprend',
  F_SAMU_TOT: 'Le geste au bon moment',
  F_INES_PIVOT: 'Le poids du silence d\'Inès',
  F_YANIS_PART: 'Yanis est parti avant',
  F14: 'Le silence de groupe',
  F_SARAH_MORT: 'Sarah ne revient pas',
  F_NOE_MORT_SILENCE: 'Noé ne revient pas',
  F_NOE_MORT_VERITE: 'La vérité, trop tard pour lui',
  F_NOE_MORT_RECIT_FAUX: 'Le récit qui reste',
  F_NOE_DISPARAIT: 'Noé disparaît',
  F_SARAH_RETOURNE: 'Sarah se retourne contre Noé',
  F_SARAH_SAIT_ET_COUVRE: 'Sarah sait et se tait',
  F_RUPTURE_FINALE: 'La rupture finale',
}

export default function CarnetPage() {
  const router = useRouter()
  const [runs, setRuns] = useState<CompletedRun[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'parties' | 'secrets' | 'succes' | 'histoire' | 'fins'>('parties')
  const [openBlock, setOpenBlock] = useState<string | null>(null)
  const [openEnding, setOpenEnding] = useState<string | null>(null)
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)

  async function handleDeleteRun(runId: string) {
    if (deleting) return
    setDeleting(runId)
    try {
      const res = await fetch(`/api/run/${runId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Suppression impossible')
      setRuns((prev) => prev.filter((r) => r.id !== runId))
      setConfirmingDelete(null)
    } catch {
      // La partie reste affichée si la suppression échoue — pas de perte silencieuse.
    } finally {
      setDeleting(null)
    }
  }

  useEffect(() => {
    // Route serveur, authentifiée par le cookie de session httpOnly — pas
    // par le SDK Firebase Auth côté client. Le carnet dépendait auparavant
    // de useAuthStore (onAuthStateChanged, persistance localStorage/IndexedDB) :
    // en PWA installée, cette persistance peut être réhydratée en retard ou,
    // sur certaines versions d'iOS, carrément vidée par l'OS entre deux
    // lancements — le joueur restait connecté côté serveur (cookie valide,
    // le dashboard fonctionnait) mais le carnet le renvoyait quand même vers
    // /login. Le cookie de session est déjà ce que /api/run/current et les
    // autres routes utilisent ; le carnet suit maintenant le même chemin,
    // ce qui élimine toute dépendance à l'état d'auth du client.
    fetch('/api/run/completed')
      .then(async (res) => {
        if (res.status === 401) { router.push('/login'); return }
        if (!res.ok) throw new Error('Impossible de charger le carnet')
        const data = await res.json()
        setRuns(data.runs ?? [])
      })
      .catch(() => setRuns([]))
      .finally(() => setLoading(false))
  }, [router])

  // ── Calcul des succès débloqués ──────────────────────────────────────────
  const allCluesFound: Set<string> = new Set(runs.flatMap((r) => (r.discoveredClues ?? []).map((dc: DiscoveredClue) => dc.clueId)))
  const allFlags = Object.assign({}, ...runs.map((r) => r.flags ?? {}))
  const allPovs = new Set(runs.map((r) => r.playerPov))
  const allEndings = new Set(runs.map((r) => r.ending))
  const maxScore = Math.max(0, ...runs.map((r) => r.finalScore ?? 0))

  function isUnlocked(ach: Achievement): boolean {
    const c = ach.condition as AchievementCondition
    if (c.type === 'runs_completed') return runs.length >= c.min
    if (c.type === 'unique_povs_used') return allPovs.size >= c.min
    if (c.type === 'clue_found_any_run') return allCluesFound.has(c.clueId)
    if (c.type === 'flag_set_any_run') return !!allFlags[c.flag]
    if (c.type === 'pov_completed') return allPovs.has(c.pov)
    if (c.type === 'pov_ending_with_flag_absent') {
      return runs.some((r) => r.playerPov === c.pov && !r.flags?.[c.flag])
    }
    if (c.type === 'ending_reached') return allEndings.has(c.endingId)
    if (c.type === 'all_endings_reached') return c.endingIds.every((id) => allEndings.has(id))
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem,5vw,3.2rem)', color: '#f5f3ee', fontWeight: 400, fontStyle: 'italic', margin: 0 }}>📓 Le Carnet</h1>
            <p style={{ color: 'rgba(212,207,200,0.5)', fontFamily: 'var(--font-body)', fontSize: '13px', marginTop: '8px' }}>
              {runs.length} partie{runs.length !== 1 ? 's' : ''} terminée{runs.length !== 1 ? 's' : ''} · {unlockedAchIds.size}/{achievementsData.length} succès · {unlockedStoryIds.size}/{storyBlocksData.length} fragments d'histoire · {allEndings.size}/{Object.keys(ENDING_SUMMARIES).length} fins découvertes
            </p>
          </div>
          <Link href="/dashboard" style={{
            padding: '10px 22px', background: '#8b1a1a', color: '#f5f3ee', borderRadius: '6px',
            fontFamily: 'var(--font-body)', fontSize: '13px', letterSpacing: '0.04em', textDecoration: 'none', flexShrink: 0,
          }}>
            🎭 Nouvelle soirée →
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {(['parties', 'secrets', 'succes', 'histoire', 'fins'] as const).map((t) => (
          <button key={t} style={tab(activeTab === t)} onClick={() => setActiveTab(t)}>
            {t === 'parties' ? '📋 Parties' : t === 'secrets' ? '🔍 Secrets' : t === 'succes' ? '🏆 Succès' : t === 'histoire' ? '📖 Histoire' : '🎭 Fins'}
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
                    {(run.ending && ENDING_LABELS[run.ending]) ?? 'Fin inconnue'}
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
                    {run.discoveredClues.map((dc: DiscoveredClue) => {
                      const meta = cluesMeta[dc.clueId]
                      return (
                        <span key={dc.clueId} style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'rgba(212,207,200,0.7)',
                          padding: '3px 10px',
                          borderRadius: '4px',
                          fontSize: '11px',
                          fontFamily: 'var(--font-body)',
                        }}>
                          <span style={{ color: 'rgba(212,207,200,0.4)', letterSpacing: '0.06em' }}>{dc.clueId}</span>
                          {meta?.label ? ` — ${meta.label}` : ''}
                        </span>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Effacer cette partie */}
              <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                {confirmingDelete !== run.id ? (
                  <button
                    onClick={() => setConfirmingDelete(run.id)}
                    style={{
                      background: 'transparent', border: 'none', color: 'rgba(212,207,200,0.35)',
                      fontFamily: 'var(--font-body)', fontSize: '11px', letterSpacing: '0.06em',
                      textTransform: 'uppercase', cursor: 'pointer', padding: 0,
                    }}
                  >
                    🗑 Effacer cette partie
                  </button>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ color: '#e07070', fontFamily: 'var(--font-body)', fontSize: '11px' }}>
                      Définitif — confirmer ?
                    </span>
                    <button
                      onClick={() => handleDeleteRun(run.id)}
                      disabled={deleting === run.id}
                      style={{
                        background: '#a01f1f', border: 'none', color: '#fff', padding: '4px 12px',
                        borderRadius: '4px', fontFamily: 'var(--font-body)', fontSize: '11px',
                        cursor: deleting === run.id ? 'wait' : 'pointer', opacity: deleting === run.id ? 0.7 : 1,
                      }}
                    >
                      {deleting === run.id ? 'Suppression…' : 'Oui, effacer'}
                    </button>
                    <button
                      onClick={() => setConfirmingDelete(null)}
                      disabled={deleting === run.id}
                      style={{
                        background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(212,207,200,0.5)',
                        padding: '4px 12px', borderRadius: '4px', fontFamily: 'var(--font-body)', fontSize: '11px', cursor: 'pointer',
                      }}
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
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

      {/* ── FINS ──────────────────────────────── */}
      {activeTab === 'fins' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <p style={{ color: 'rgba(212,207,200,0.4)', fontFamily: 'var(--font-body)', fontSize: '12px', marginBottom: '8px' }}>
            {allEndings.size}/{Object.keys(ENDING_SUMMARIES).length} dénouements découverts. Les fins non vécues restent floutées, pour ne rien spoiler d'une future partie.
          </p>
          {(Object.keys(ENDING_SUMMARIES) as EndingId[]).map((id) => {
            const unlocked = allEndings.has(id)
            const isOpen = openEnding === id
            const summary = ENDING_SUMMARIES[id]
            return (
              <div
                key={id}
                style={{ ...card, opacity: unlocked ? 1 : 0.5, cursor: unlocked ? 'pointer' : 'default' }}
                onClick={() => unlocked && setOpenEnding(isOpen ? null : id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
                  <p style={{
                    color: unlocked ? '#f5f3ee' : 'rgba(212,207,200,0.5)',
                    fontFamily: 'var(--font-display)', fontSize: '16px', fontStyle: 'italic', margin: 0,
                    filter: unlocked ? 'none' : 'blur(5px)',
                    userSelect: unlocked ? 'auto' : 'none',
                  }}>
                    {summary.title}
                  </p>
                  {unlocked ? (
                    <span style={{ color: 'rgba(212,207,200,0.4)', fontSize: '12px', flexShrink: 0 }}>{isOpen ? '▲' : '▼'}</span>
                  ) : (
                    <span style={{ color: 'rgba(212,207,200,0.3)', fontSize: '16px', flexShrink: 0 }}>🔒</span>
                  )}
                </div>
                {unlocked && !isOpen && (
                  <p style={{ color: 'rgba(212,207,200,0.55)', fontFamily: 'var(--font-body)', fontSize: '12px', margin: '8px 0 0', lineHeight: 1.6 }}>
                    {summary.short}
                  </p>
                )}
                {unlocked && isOpen && (
                  <div style={{ marginTop: '14px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ color: 'rgba(212,207,200,0.8)', fontFamily: 'var(--font-body)', fontSize: '13px', lineHeight: 1.8, margin: 0 }}>
                      {summary.detail}
                    </p>
                    <p style={{ color: '#c8a96e', fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '14px', margin: '14px 0 0' }}>
                      {summary.lastLine}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

    </main>
  )
}
