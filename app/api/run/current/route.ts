// GET /api/run/current — la partie en cours (non terminée) du joueur connecté, s'il y en a une
import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/types/firebase'
import type { RunState } from '@/types'

export async function GET(req: NextRequest) {
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

    const snap = await adminDb.collection(COLLECTIONS.runs).where('playerId', '==', uid).get()
    const inProgress = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as RunState & { updatedAt?: number }) }))
      .filter((r) => !r.isComplete)
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))

    const run = inProgress[0] ?? null
    return NextResponse.json({ run })
  } catch (err) {
    console.error('[GET /api/run/current]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
