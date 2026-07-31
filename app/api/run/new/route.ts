// POST /api/run/new — crée un nouveau run et redirige vers /run/:id
import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/types/firebase'
import { INITIAL_CHARACTER_STATE } from '@/lib/types/characters'
import type { CharacterId } from '@/lib/types/characters'
import { BASE_SEATING } from '@/lib/types/house'
import { resolveHostIntent, resolveSeatingVariant } from '@/lib/engine/deviation'
import { initBackgroundFlags } from '@/lib/engine/flags'
import type { RunState } from '@/types'

export async function POST(req: NextRequest) {
  try {
    // Vérifier la session
    const session = req.cookies.get('__session')?.value
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    let uid: string
    try {
      const decoded = await adminAuth.verifySessionCookie(session, true)
      uid = decoded.uid
    } catch {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 })
    }

    const { character } = await req.json() as { character: CharacterId }
    const validCharacters: CharacterId[] = ['maelys', 'noe', 'ines', 'lucas', 'sarah', 'yanis']
    if (!validCharacters.includes(character)) {
      return NextResponse.json({ error: 'Personnage invalide' }, { status: 400 })
    }

    // Créer le run Firestore
    const runRef = adminDb.collection(COLLECTIONS.runs).doc()
    const now = Date.now()

    const seatingHistory = {
      seating_planned: BASE_SEATING,
      seating_before_main: BASE_SEATING,
      seating_at_critical: BASE_SEATING,
      seating_after_incident: BASE_SEATING,
    }

    const run: RunState = {
      runId: runRef.id,
      createdAt: now,
      playerPov: character,
      povHistory: [character],
      canon: {
        maelysOrganizedWithFalsePretext: true,
        intentExistedBeforeFirstGuest: true,
        vectorPreparedInAdvance: true,
        plannedTargetIsNotSarah: true,
        maelysLostControlAtService: true,
        witnessStayedSilentWithinHour: true,
        sarahAffectedInAllBranches: true,
        collectiveNarrativeBuilt: true,
        noPovHasCompleteView: true,
      },
      variable: {
        hostIntent: resolveHostIntent(
          INITIAL_CHARACTER_STATE.maelysControle,
          INITIAL_CHARACTER_STATE.maelysColere
        ),
        targetPlanned: 'noe',
        targetActual: [],
        poisonVector: 'sauce',
        serviceHelper: 'maelys',
        witnessOfCriticalMove: null,
        accompliceType: 'none',
        seatingVariant: resolveSeatingVariant(0, INITIAL_CHARACTER_STATE.yanisJeuSocial),
        seatingHistory,
        deaths: [],
        survivors: [],
        survivingNarrative: 'truth_complete',
        characterState: INITIAL_CHARACTER_STATE,
        socialTension: 0,
        memoryDistortion: 0,
      },
      subjective: {
        believedTargetPlanned: null,
        believedTargetActual: null,
        believedNarrative: 'truth_complete',
        ownRoleBelieved: '',
        openingMemoryError: '',
      },
      currentScene: 'scene_01_opening_memory',
      visitedScenes: [],
      completedScenes: [],
      sceneHistory: [],
      // Flags de fond (chapitre 3) activés dès le début
      flags: initBackgroundFlags(),
      discoveredClues: [],
      isComplete: false,
    }

    await runRef.set({ ...run, playerId: uid, updatedAt: now })

    return NextResponse.json({ runId: runRef.id })
  } catch (err) {
    console.error('[POST /api/run/new]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
