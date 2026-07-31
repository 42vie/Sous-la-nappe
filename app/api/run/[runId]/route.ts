// API Route — lire (GET) ou mettre à jour (PATCH) un run
import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/types/firebase'

export async function GET(
  _req: NextRequest,
  { params }: { params: { runId: string } }
) {
  const snap = await adminDb.collection(COLLECTIONS.runs).doc(params.runId).get()
  if (!snap.exists) {
    return NextResponse.json({ error: 'Run introuvable' }, { status: 404 })
  }
  return NextResponse.json(snap.data())
}

export async function PATCH(
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

    const runRef = adminDb.collection(COLLECTIONS.runs).doc(params.runId)
    const snap = await runRef.get()
    if (!snap.exists) {
      return NextResponse.json({ error: 'Run introuvable' }, { status: 404 })
    }
    if (snap.data()?.playerId !== uid) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const updates = await req.json()
    await runRef.update({
      ...updates,
      updatedAt: Date.now(),
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH /api/run/:id]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
