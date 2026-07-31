// API Route — créer un run (POST) / lister les runs du joueur (GET)
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/types/firebase'
import type { RunState } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // TODO: vérifier le token Firebase Auth avec adminAuth
    const { playerId, playerCharacter } = body

    if (!playerId || !playerCharacter) {
      return NextResponse.json(
        { error: 'playerId et playerCharacter requis' },
        { status: 400 }
      )
    }

    const docRef = adminDb.collection(COLLECTIONS.runs).doc()

    const run: Partial<RunState> = {
      id: docRef.id,
      playerId,
      playerCharacter,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      currentScene: 1,
      discoveredClues: [],
      sceneChoices: {},
      flags: {},
    }

    await docRef.set(run)

    return NextResponse.json({ runId: docRef.id }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/run]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
