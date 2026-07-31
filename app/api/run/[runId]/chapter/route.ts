// POST /api/run/[runId]/chapter — choisir le personnage du prochain chapitre
import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/types/firebase'
import { TOTAL_CHAPTERS } from '@/lib/engine/chapters'
import type { CharacterId } from '@/lib/types/characters'
import type { RunState } from '@/types'

const ALL_CHARACTERS: CharacterId[] = ['maelys', 'noe', 'ines', 'lucas', 'sarah', 'yanis']

export async function POST(
  req: NextRequest,
  { params }: { params: { runId: string } }
) {
  try {
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
    if (!ALL_CHARACTERS.includes(character)) {
      return NextResponse.json({ error: 'Personnage invalide' }, { status: 400 })
    }

    const runRef = adminDb.collection(COLLECTIONS.runs).doc(params.runId)
    const snap = await runRef.get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Run introuvable' }, { status: 404 })
    }
    const state = snap.data() as RunState & { playerId?: string }
    if (state.playerId !== uid) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const povHistory = state.povHistory ?? [state.playerPov]
    if (povHistory.length >= TOTAL_CHAPTERS) {
      return NextResponse.json({ error: 'Tous les chapitres ont déjà un personnage assigné' }, { status: 409 })
    }
    if (povHistory.includes(character)) {
      return NextResponse.json({ error: 'Ce personnage a déjà été incarné cette partie' }, { status: 409 })
    }

    const updatedPovHistory = [...povHistory, character]
    await runRef.update({
      playerPov: character,
      povHistory: updatedPovHistory,
      updatedAt: Date.now(),
    })

    return NextResponse.json({
      run: { ...state, playerPov: character, povHistory: updatedPovHistory },
    })
  } catch (err) {
    console.error('[POST /api/run/[runId]/chapter]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
