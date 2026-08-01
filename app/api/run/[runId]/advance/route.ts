// POST /api/run/[runId]/advance
// Avance d'une scène en appliquant un choix
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/types/firebase'
import { getScene, getAvailableChoices, applyChoice, applyOnEnterEffects } from '@/lib/engine/sceneRunner'
import { isRunComplete } from '@/lib/engine/transitions'
import { buildDiscoveredClue } from '@/lib/engine/clueResolver'
import { calculateEnding } from '@/lib/engine/endingCalculator'
import { getOverheardConversation } from '@/lib/engine/overheard'
import type { RunState } from '@/types'

interface AdvanceBody {
  choiceId: string
  sceneId: string
}

export async function POST(
  req: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const { runId } = params
    const body: AdvanceBody = await req.json()
    const { choiceId, sceneId } = body

    if (!choiceId || !sceneId) {
      return NextResponse.json(
        { error: 'choiceId et sceneId requis' },
        { status: 400 }
      )
    }

    // 1. Charger le run depuis Firestore
    const runDoc = await adminDb.collection(COLLECTIONS.runs).doc(runId).get()
    if (!runDoc.exists) {
      return NextResponse.json({ error: 'Run introuvable' }, { status: 404 })
    }
    const state = runDoc.data() as RunState

    // 2. Vérifier que le run n'est pas déjà terminé
    if (state.isComplete) {
      return NextResponse.json({ error: 'Run déjà terminé' }, { status: 409 })
    }

    // 3. Charger la scène et valider le choix
    const scene = getScene(sceneId)
    if (!scene) {
      return NextResponse.json({ error: 'Scène introuvable' }, { status: 404 })
    }

    const availableChoices = getAvailableChoices(scene, state)
    const choiceValid = availableChoices.some((c) => c.id === choiceId)
    if (!choiceValid) {
      return NextResponse.json(
        { error: 'Choix non disponible pour ce POV ou cet état' },
        { status: 403 }
      )
    }

    // 4. Appliquer le choix
    const result = applyChoice(scene, choiceId, state)

    // 5. Construire les nouveaux indices découverts
    const newDiscoveredClues = result.cluesRevealed.map((clueId) =>
      buildDiscoveredClue(clueId, state.playerPov, scene.index)
    )

    // 6. Préparer le nouveau state
    const updatedSceneHistory = [
      ...state.sceneHistory,
      {
        sceneId: scene.id,
        choicesMade: [choiceId],
        cluesFound: result.cluesRevealed,
        timestamp: Date.now(),
        narrativeNotes: result.narrativeInjections,
      },
    ]

    const updatedFlags = {
      ...state.flags,
      ...result.flagUpdates,
    }

    const updatedState: Partial<RunState> = {
      ...result.stateUpdates,
      flags: updatedFlags,
      currentScene: result.nextScene ?? state.currentScene,
      visitedScenes: [...new Set([...state.visitedScenes, scene.id])],
      completedScenes: [...new Set([...state.completedScenes, scene.id])],
      discoveredClues: [...state.discoveredClues, ...newDiscoveredClues],
      sceneHistory: updatedSceneHistory,
    }

    // 7. Vérifier si le run est maintenant terminé
    const stateForCompletion = { ...state, ...updatedState } as RunState
    if (isRunComplete(stateForCompletion)) {
      const endingId = calculateEnding(stateForCompletion)
      updatedState.ending = endingId
      updatedState.isComplete = true
    }

    // Delta de tension de ce choix précis — sert uniquement à afficher un
    // commentaire qualitatif côté client (SceneEngine), pas un mécanisme.
    const tensionBefore = state.variable.socialTension ?? 0
    const tensionAfter = stateForCompletion.variable.socialTension ?? tensionBefore
    const tensionDelta = tensionAfter - tensionBefore

    // 8. Persister dans Firestore
    await adminDb
      .collection(COLLECTIONS.runs)
      .doc(runId)
      .update({ ...updatedState, updatedAt: Date.now() })

    return NextResponse.json({
      ok: true,
      nextScene: result.nextScene,
      cluesRevealed: result.cluesRevealed,
      flagUpdates: result.flagUpdates,
      narrativeInjections: result.narrativeInjections,
      minigameToLaunch: result.minigameToLaunch ?? null,
      isComplete: updatedState.isComplete ?? false,
      ending: updatedState.ending ?? null,
      tensionDelta,
    })
  } catch (err) {
    console.error('[POST /api/run/[runId]/advance]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

/** GET /api/run/[runId]/advance — charger la scène courante avec les choix disponibles */
export async function GET(
  req: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
    const { runId } = params
    const runDoc = await adminDb.collection(COLLECTIONS.runs).doc(runId).get()
    if (!runDoc.exists) {
      return NextResponse.json({ error: 'Run introuvable' }, { status: 404 })
    }
    const state = runDoc.data() as RunState
    const scene = getScene(state.currentScene)
    if (!scene) {
      return NextResponse.json({ error: 'Scène courante introuvable' }, { status: 404 })
    }

    const availableChoices = getAvailableChoices(scene, state)
    const onEnterUpdates = applyOnEnterEffects(scene, state)

    return NextResponse.json({
      scene: {
        id: scene.id,
        index: scene.index,
        title: scene.title,
        narrative: scene.narrativeBlocks[state.playerPov] ?? scene.narrativeBlocks.default,
        minigameId: scene.minigameId ?? null,
        canonicalFacts: scene.canonicalFacts,
        overheard: getOverheardConversation(scene.id, state.playerPov, state),
      },
      choices: availableChoices.map((c) => ({
        id: c.id,
        verb: c.verb,
        label: c.label,
        description: c.description ?? null,
      })),
      onEnterUpdates,
    })
  } catch (err) {
    console.error('[GET /api/run/[runId]/advance]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
