'use client'

import { useRouter } from 'next/navigation'
import { signOut } from '@/lib/firebase/auth'

interface SignOutButtonProps {
  className?: string
  label?: string
}

export function SignOutButton({ label = 'Se déconnecter' }: SignOutButtonProps) {
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    // Supprimer le cookie de session côté serveur
    await fetch('/api/auth/session', { method: 'DELETE' })
    router.push('/login')
  }

  return (
    <button
      onClick={handleSignOut}
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-faint)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        textDecoration: 'underline',
        cursor: 'pointer',
        background: 'none',
        border: 'none',
        padding: 0,
      }}
    >
      {label}
    </button>
  )
}
