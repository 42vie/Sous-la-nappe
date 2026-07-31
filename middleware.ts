// Middleware Next.js — protection des routes /run et /dashboard
import { NextResponse, type NextRequest } from 'next/server'

// Routes qui nécessitent d'être connecté
const PROTECTED_PREFIXES = ['/run', '/dashboard']
// Routes réservées aux utilisateurs non connectés (redirect si déjà connecté)
const AUTH_ROUTES = ['/login', '/register']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Lire le cookie de session Firebase (posé côté serveur après sign-in)
  // Si absent → l'utilisateur n'est pas authentifié côté serveur
  const session = req.cookies.get('__session')?.value

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isAuthRoute  = AUTH_ROUTES.some((p) => pathname.startsWith(p))

  if (isProtected && !session) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && session) {
    const url = req.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
