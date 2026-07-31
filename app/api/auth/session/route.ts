// API Route — créer / supprimer le cookie de session Firebase Admin
import { NextRequest, NextResponse } from 'next/server'
import { getAdminAuth } from '@/lib/firebase/admin'

export const runtime = 'nodejs'

const SESSION_DURATION_MS = 60 * 60 * 24 * 14 * 1000 // 14 jours

/** POST /api/auth/session — échange un idToken client contre un cookie de session */
export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json()
    if (!idToken) return NextResponse.json({ error: 'idToken manquant' }, { status: 400 })

    const sessionCookie = await getAdminAuth().createSessionCookie(idToken, {
      expiresIn: SESSION_DURATION_MS,
    })

    const res = NextResponse.json({ ok: true })
    res.cookies.set('__session', sessionCookie, {
      maxAge: SESSION_DURATION_MS / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    })
    return res
  } catch (err) {
    console.error('[POST /api/auth/session]', err)
    return NextResponse.json({ error: 'Session invalide' }, { status: 401 })
  }
}

/** DELETE /api/auth/session — déconnexion */
export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.set('__session', '', { maxAge: 0, path: '/' })
  return res
}
