// Auth helpers — email + password uniquement
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  type User,
} from 'firebase/auth'
import { auth } from './client'

/** Créer un compte email + mot de passe */
export async function signUp(
  email: string,
  password: string,
  displayName?: string
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  if (displayName) {
    await updateProfile(credential.user, { displayName })
  }
  return credential.user
}

/** Se connecter avec email + mot de passe */
export async function signIn(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  return credential.user
}

/** Se déconnecter */
export async function signOut(): Promise<void> {
  await firebaseSignOut(auth)
}

/** Envoyer un mail de réinitialisation */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email)
}

/** Écouter le changement d'état d'auth (retourne un unsubscribe) */
export function onAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback)
}

/** Obtenir l'utilisateur courant de manière synchrone */
export function currentUser(): User | null {
  return auth.currentUser
}
