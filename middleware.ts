// Middleware Next.js — protection des routes
import { NextResponse, type NextRequest } from 'next/server'

// Routes qui nécessitent d'être connecté
const PROTECTED_PREFIXES = ['/run', '/dashboard']

// Routes réservées aux non-connectés (redirect si déjà connecté)
const AUTH_ROUTES = ['/login', '/register']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const session = req.cookies.get('__session')?.value

  // Note : app/(game)/page.tsx est servie à l'URL /
  // Le dashboard réel est app/(game)/page.tsx (route groupée sans segment URL)
  // On protège aussi /dashboard si cette route existe

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isAuthRoute  = AUTH_ROUTES.some((p) => pathname.startsWith(p))
  const isRoot = pathname === '/'

  // Route protégée sans session → login
  if (isProtected && !session) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Page de login avec session active → accueil
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
