// GET /api/run/completed — toutes les parties terminées du joueur connecté (le Carnet)
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
    const runs = snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as RunState & { updatedAt?: number }) }))
      .filter((r) => r.isComplete)
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))

    return NextResponse.json({ runs })
  } catch (err) {
    console.error('[GET /api/run/completed]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
