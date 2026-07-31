// API Route — lire (GET) ou mettre à jour (PATCH) un run
import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
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
    const updates = await req.json()
    await adminDb.collection(COLLECTIONS.runs).doc(params.runId).update({
      ...updates,
      updatedAt: Date.now(),
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[PATCH /api/run/:id]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
