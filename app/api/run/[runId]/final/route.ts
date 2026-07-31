// GET /api/run/[runId]/final — rapport 3 colonnes + questions du quiz final
// POST /api/run/[runId]/final — soumettre les réponses, calculer et persister le score
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/types/firebase'
import { buildFinalReport } from '@/lib/engine/endingCalculator'
import type { RunState } from '@/types'
import questionsRaw from '@/data/questions_final.json'

interface QuestionOption {
  id: string
  label: string
  scoreDelta: number
}

interface QuestionData {
  id: string
  index: number
  label: string
  weight: number
  options: QuestionOption[]
  canonicalAnswer: string
}

const QUESTIONS = questionsRaw as unknown as QuestionData[]

type StoredRun = RunState & { finalScore?: number; finalAnswers?: Record<string, string> }

/** GET — rapport final + questions (sans le barème, pour ne pas exposer les réponses) */
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

    return NextResponse.json({
      report,
      ending: state.ending ?? null,
      discoveredCluesCount: state.discoveredClues?.length ?? 0,
      score: state.finalScore ?? null,
      answers: state.finalAnswers ?? null,
      questions: QUESTIONS.map((q) => ({
        id: q.id,
        index: q.index,
        label: q.label,
        weight: q.weight,
        options: q.options.map((o) => ({ id: o.id, label: o.label })),
      })),
    })
  } catch (err) {
    console.error('[GET /api/run/[runId]/final]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/** POST — soumettre les réponses au quiz de reconstruction (chapitre 14 de la bible) */
export async function POST(
  req: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const snap = await adminDb.collection(COLLECTIONS.runs).doc(params.runId).get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Run introuvable' }, { status: 404 })
    }

    const { answers } = await req.json() as { answers: Record<string, string> }
    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Réponses manquantes' }, { status: 400 })
    }

    let score = 0
    const breakdown = QUESTIONS.map((q) => {
      const chosenId = answers[q.id]
      const option = q.options.find((o) => o.id === chosenId)
      const scoreDelta = option?.scoreDelta ?? 0
      score += scoreDelta
      return { questionId: q.id, correct: chosenId === q.canonicalAnswer, scoreDelta }
    })
    score = Math.max(0, Math.min(100, Math.round(score)))

    await adminDb.collection(COLLECTIONS.runs).doc(params.runId).update({
      finalScore: score,
      finalAnswers: answers,
    })

    return NextResponse.json({ score, breakdown })
  } catch (err) {
    console.error('[POST /api/run/[runId]/final]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
