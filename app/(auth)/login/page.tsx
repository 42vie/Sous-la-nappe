import { AuthForm } from '@/components/ui/AuthForm'

export const metadata = { title: 'Connexion — Sous la nappe' }

export default function LoginPage() {
  return (
    <main
      style={{
        position: 'relative',
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8)',
        overflow: 'hidden',
      }}
    >
      {/* Détail discret, tiré de la photo d'accueil — presque invisible, jamais expliqué */}
      <img
        src="/images/skeleton-hand.png"
        alt=""
        aria-hidden
        style={{
          position: 'absolute',
          bottom: '-20px',
          right: '-10px',
          width: 130,
          opacity: 0.55,
          filter: 'grayscale(0.2)',
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      />
      <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>

        {/* Logo / titre */}
        <div style={{ textAlign: 'center' }}>
          <p style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-xl)',
            color: 'var(--color-text)',
            fontStyle: 'italic',
            marginBottom: 'var(--space-2)',
          }}>
            Sous la nappe
          </p>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-faint)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}>
            Un dîner. Six points de vue. Une vérité.
          </p>
        </div>

        {/* Formulaire */}
        <div style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-8)',
        }}>
          <AuthForm />
        </div>

      </div>
    </main>
  )
}
