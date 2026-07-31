'use client'

import { useState, useRef, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { signIn, signUp, resetPassword } from '@/lib/firebase/auth'

type Mode = 'login' | 'register' | 'reset'

const LABELS: Record<Mode, string> = {
  login: 'Connexion',
  register: 'Créer un compte',
  reset: 'Réinitialiser le mot de passe',
}

// Messages d'erreur Firebase → français
function friendlyError(code: string): string {
  switch (code) {
    case 'auth/invalid-email':         return 'Adresse e-mail invalide.'
    case 'auth/user-not-found':        return 'Aucun compte trouvé pour cet e-mail.'
    case 'auth/wrong-password':        return 'Mot de passe incorrect.'
    case 'auth/invalid-credential':    return 'E-mail ou mot de passe incorrect.'
    case 'auth/email-already-in-use':  return 'Cette adresse est déjà utilisée.'
    case 'auth/weak-password':         return 'Mot de passe trop court (6 caractères minimum).'
    case 'auth/too-many-requests':     return 'Trop de tentatives. Réessayez dans quelques minutes.'
    case 'auth/network-request-failed':return 'Problème réseau. Vérifiez votre connexion.'
    default: return 'Une erreur est survenue. Réessayez.'
  }
}

export function AuthForm() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resetSent, setResetSent] = useState(false)

  const emailRef    = useRef<HTMLInputElement>(null)
  const passwordRef = useRef<HTMLInputElement>(null)
  const nameRef     = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const email    = emailRef.current?.value.trim() ?? ''
    const password = passwordRef.current?.value ?? ''
    const name     = nameRef.current?.value.trim() ?? ''

    try {
      if (mode === 'reset') {
        await resetPassword(email)
        setResetSent(true)
        setLoading(false)
        return
      }

      if (mode === 'register') {
        await signUp(email, password, name || undefined)
      } else {
        await signIn(email, password)
      }

      router.push('/')
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      setError(friendlyError(code))
    } finally {
      setLoading(false)
    }
  }

  // ─── Styles inline (cohérents avec le design system du projet) ───────────
  const s = {
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 'var(--space-5)',
      width: '100%',
    },
    fieldGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: 'var(--space-2)',
    },
    label: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-xs)',
      color: 'var(--color-text-muted)',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.08em',
    },
    input: {
      width: '100%',
      padding: 'var(--space-3) var(--space-4)',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      color: 'var(--color-text)',
      outline: 'none',
      transition: 'border-color var(--transition)',
    },
    btn: {
      width: '100%',
      padding: 'var(--space-3) var(--space-4)',
      background: 'var(--color-primary)',
      color: 'var(--color-text-inverse)',
      border: 'none',
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-sm)',
      letterSpacing: '0.04em',
      cursor: 'pointer',
      transition: 'opacity var(--transition)',
    },
    ghost: {
      background: 'none',
      border: 'none',
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-xs)',
      color: 'var(--color-primary)',
      cursor: 'pointer',
      textDecoration: 'underline',
      padding: 0,
    },
    error: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-xs)',
      color: 'var(--color-error)',
      padding: 'var(--space-3) var(--space-4)',
      background: 'var(--color-error-highlight)',
      borderRadius: 'var(--radius-md)',
    },
    success: {
      fontFamily: 'var(--font-body)',
      fontSize: 'var(--text-xs)',
      color: 'var(--color-success)',
      padding: 'var(--space-3) var(--space-4)',
      background: 'var(--color-success-highlight)',
      borderRadius: 'var(--radius-md)',
    },
  }

  if (resetSent) {
    return (
      <div style={s.success}>
        E-mail de réinitialisation envoyé. Vérifiez votre boîte.
        <button style={{ ...s.ghost, display: 'block', marginTop: 'var(--space-3)' }} onClick={() => { setResetSent(false); setMode('login') }}>
          Retour à la connexion
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} style={s.form} noValidate>

      {/* Champ nom (inscription uniquement) */}
      {mode === 'register' && (
        <div style={s.fieldGroup}>
          <label htmlFor="auth-name" style={s.label}>Prénom ou pseudonyme</label>
          <input
            id="auth-name"
            ref={nameRef}
            type="text"
            autoComplete="name"
            placeholder="Marie"
            style={s.input}
          />
        </div>
      )}

      {/* Champ e-mail */}
      <div style={s.fieldGroup}>
        <label htmlFor="auth-email" style={s.label}>Adresse e-mail</label>
        <input
          id="auth-email"
          ref={emailRef}
          type="email"
          autoComplete={mode === 'login' ? 'email' : 'new-email'}
          required
          placeholder="marie@exemple.fr"
          style={s.input}
        />
      </div>

      {/* Champ mot de passe (pas sur reset) */}
      {mode !== 'reset' && (
        <div style={s.fieldGroup}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label htmlFor="auth-password" style={s.label}>Mot de passe</label>
            {mode === 'login' && (
              <button type="button" style={s.ghost} onClick={() => { setMode('reset'); setError(null) }}>
                Mot de passe oublié ?
              </button>
            )}
          </div>
          <input
            id="auth-password"
            ref={passwordRef}
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            minLength={6}
            placeholder="••••••••"
            style={s.input}
          />
        </div>
      )}

      {/* Message d'erreur */}
      {error && <p style={s.error} role="alert">{error}</p>}

      {/* Bouton principal */}
      <button
        type="submit"
        disabled={loading}
        style={{ ...s.btn, opacity: loading ? 0.6 : 1 }}
      >
        {loading ? 'Chargement…' : LABELS[mode]}
      </button>

      {/* Liens de changement de mode */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)' }}>
        {mode !== 'login' && (
          <button type="button" style={s.ghost} onClick={() => { setMode('login'); setError(null) }}>
            J'ai déjà un compte
          </button>
        )}
        {mode !== 'register' && mode !== 'reset' && (
          <button type="button" style={s.ghost} onClick={() => { setMode('register'); setError(null) }}>
            Créer un compte
          </button>
        )}
        {mode === 'reset' && (
          <button type="button" style={s.ghost} onClick={() => { setMode('login'); setError(null) }}>
            Retour à la connexion
          </button>
        )}
      </div>
    </form>
  )
}
