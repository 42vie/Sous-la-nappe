// GET /api/run/[runId]/final — rapport 3 colonnes, manuscrit, épilogue, score
// POST /api/run/[runId]/final — soumettre le plan de table deviné (bonus optionnel)
//
// Pas de questionnaire : le score se calcule depuis ce que le joueur a
// réellement découvert en jouant (le manuscrit), pas depuis un QCM rempli
// après coup. Le seul geste qui reste à la fin est optionnel et concret :
// reconstituer le plan de table du moment critique.
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/types/firebase'
import { buildFinalReport } from '@/lib/engine/endingCalculator'
import { getManuscriptStatus } from '@/lib/engine/manuscript'
import { getPovSummaries } from '@/lib/engine/povSummary'
import { buildEpilogue } from '@/lib/engine/epilogue'
import { buildRecap } from '@/lib/engine/recap'
import { CHRONOLOGY } from '@/lib/engine/backstory'
import type { RunState } from '@/types'

const SEAT_IDS = [1, 2, 3, 4, 5, 6]
const MANUSCRIPT_WEIGHT = 85
const SEATING_WEIGHT = 15

type StoredRun = RunState & {
  finalScore?: number
  finalSeatingGuess?: Record<string, string>
}

function manuscriptScore(state: RunState): number {
  const manuscript = getManuscriptStatus(state)
  if (manuscript.length === 0) return 0
  const ratio = manuscript.reduce((sum, e) => sum + e.progress, 0) / manuscript.length
  return Math.round(ratio * MANUSCRIPT_WEIGHT)
}

/** GET — rapport final, manuscrit, épilogue et score (calculé, pas déclaré) */
export async function GET(
  _req: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const snap = await adminDb.collection(COLLECTIONS.runs).doc(params.runId).get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Run introuvable' }, { status: 404 })
    }
    const state = snap.data() as StoredRun
    if (!state.isComplete) {
      return NextResponse.json({ error: 'Run non terminé' }, { status: 409 })
    }

    const report = buildFinalReport(state)
    const baseScore = manuscriptScore(state)
    const seatingSubmitted = state.finalSeatingGuess != null
    const score = seatingSubmitted ? (state.finalScore ?? baseScore) : baseScore
    const epilogue = buildEpilogue(state)
    const deceased = epilogue.statuses.find((s) => s.condition === 'decede')

    return NextResponse.json({
      report,
      ending: state.ending ?? null,
      discoveredCluesCount: state.discoveredClues?.length ?? 0,
      score,
      baseScore,
      seatingBonusAvailable: !seatingSubmitted,
      seatingGuess: state.finalSeatingGuess ?? null,
      manuscript: getManuscriptStatus(state),
      epilogue,
      recap: buildRecap(state),
      // La partie est finie : la chronologie complète (les 6 fractures) est
      // révélée, y compris la phase 6 jamais montrée en jeu (la mise en
      // scène du dîner elle-même).
      chronology: CHRONOLOGY,
      povHistory: state.povHistory ?? [state.playerPov],
      povSummaries: getPovSummaries(state),
      // Vérité canonique (chapitre 2 de la bible) : Maëlys a organisé la
      // soirée sous un faux prétexte dans tous les runs — ce n'est pas
      // aléatoire, c'est un des 9 invariants du canon.
      culprit: 'maelys',
      deceasedCharacter: deceased?.character ?? null,
    })
  } catch (err) {
    console.error('[GET /api/run/[runId]/final]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/** POST — soumettre le plan de table deviné (bonus optionnel, +15 pts max) */
export async function POST(
  req: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const snap = await adminDb.collection(COLLECTIONS.runs).doc(params.runId).get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Run introuvable' }, { status: 404 })
    }
    const state = snap.data() as StoredRun

    const { seatingGuess } = await req.json() as { seatingGuess?: Record<string, string> }
    if (!seatingGuess || typeof seatingGuess !== 'object') {
      return NextResponse.json({ error: 'Plan de table manquant' }, { status: 400 })
    }

    const trueSeating = state.variable?.seatingHistory?.seating_at_critical ?? {}
    const correctSeats = SEAT_IDS.filter(
      (seat) => seatingGuess[String(seat)] && seatingGuess[String(seat)] === trueSeating[seat as unknown as keyof typeof trueSeating]
    ).length
    const seatingBonus = Math.round((correctSeats / SEAT_IDS.length) * SEATING_WEIGHT)
    const score = Math.max(0, Math.min(100, manuscriptScore(state) + seatingBonus))

    await adminDb.collection(COLLECTIONS.runs).doc(params.runId).update({
      finalScore: score,
      finalSeatingGuess: seatingGuess,
    })

    return NextResponse.json({ score, correctSeats })
  } catch (err) {
    console.error('[POST /api/run/[runId]/final]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
