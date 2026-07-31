// Firebase Admin — initialisation lazy (jamais exécutée au build, seulement à la 1re requête)
import { initializeApp, getApps, cert, type App } from 'firebase-admin/app'
import { getAuth, type Auth } from 'firebase-admin/auth'
import { getFirestore, type Firestore } from 'firebase-admin/firestore'

let _app:  App       | null = null
let _auth: Auth      | null = null
let _db:   Firestore | null = null

function getAdminApp(): App {
  if (_app) return _app

  const projectId   = process.env.FIREBASE_ADMIN_PROJECT_ID
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL
  const privateKey  = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      '[Firebase Admin] Variables d\'env manquantes : ' +
      'FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY'
    )
  }

  if (getApps().length > 0) {
    _app = getApps()[0]
    return _app
  }

  _app = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) })
  return _app
}

export function getAdminAuth(): Auth {
  if (_auth) return _auth
  _auth = getAuth(getAdminApp())
  return _auth
}

export function getAdminDb(): Firestore {
  if (_db) return _db
  _db = getFirestore(getAdminApp())
  return _db
}

// Exports de compatibilité — résolus lazily, jamais au top-level
export const adminAuth = new Proxy({} as Auth, {
  get(_t, prop) {
    return (getAdminAuth() as unknown as Record<string, unknown>)[prop as string]
  },
})

export const adminDb = new Proxy({} as Firestore, {
  get(_t, prop) {
    return (getAdminDb() as unknown as Record<string, unknown>)[prop as string]
  },
})
