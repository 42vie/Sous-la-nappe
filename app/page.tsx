import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'

export default function LandingPage() {
  // Si déjà connecté → dashboard directement
  const session = cookies().get('__session')?.value
  if (session) redirect('/dashboard')

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-8)',
        background: 'var(--color-bg)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Grain de fond */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Trait décoratif haut */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          top: 'var(--space-12)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1px',
          height: 'var(--space-16)',
          background: 'var(--color-divider)',
        }}
      />

      {/* Contenu centré */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          maxWidth: '42ch',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-8)',
        }}
      >
        {/* Logo SVG nappe */}
        <div aria-hidden style={{ marginBottom: 'var(--space-2)' }}>
          <svg
            width="72"
            height="48"
            viewBox="0 0 72 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Table */}
            <rect x="4" y="10" width="64" height="32" rx="3" fill="#1a1714" stroke="#2a2520" strokeWidth="1" />
            {/* Nappe principale */}
            <rect x="4" y="10" width="64" height="28" rx="3" fill="#f5f3ee" />
            {/* Ombre nappe */}
            <rect x="4" y="34" width="64" height="4" rx="0" fill="#e0dbd2" />
            {/* Coin relevé bas-gauche — révèle le dessous sombre */}
            <path d="M4 38 Q4 42 10 42 L4 48 Z" fill="#1a1714" />
            <path d="M4 38 Q8 40 10 42 L4 48 Z" fill="#100e0c" stroke="#2a2520" strokeWidth="0.5" />
            {/* Pli ombre */}
            <path d="M4 38 Q10 36 14 40" stroke="#cec7b9" strokeWidth="0.75" fill="none" />
            {/* Couvert gauche */}
            <rect x="14" y="17" width="1" height="12" rx="0.5" fill="#cec7b9" />
            <ellipse cx="14.5" cy="15.5" rx="3" ry="2" fill="none" stroke="#cec7b9" strokeWidth="0.75" />
            {/* Couvert droit */}
            <rect x="54" y="17" width="1" height="12" rx="0.5" fill="#cec7b9" />
            <rect x="57" y="17" width="1" height="12" rx="0.5" fill="#cec7b9" />
            {/* Assiette */}
            <ellipse cx="36" cy="24" rx="9" ry="6" fill="none" stroke="#cec7b9" strokeWidth="0.75" />
            <ellipse cx="36" cy="24" rx="5.5" ry="3.5" fill="none" stroke="#e5e0d7" strokeWidth="0.5" />
            {/* Lueur bougie */}
            <ellipse cx="36" cy="24" rx="14" ry="9" fill="url(#glow)" />
            <defs>
              <radialGradient id="glow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#8b1a1a" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#8b1a1a" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        {/* Titre */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            color: 'var(--color-text)',
            fontWeight: 400,
            fontStyle: 'italic',
            letterSpacing: '0.02em',
            lineHeight: 1.1,
          }}
        >
          Sous la nappe
        </h1>

        {/* Accroche */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-muted)',
              lineHeight: 1.7,
              fontStyle: 'italic',
            }}
          >
            Il y a eu un dîner.
          </p>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text-muted)',
              lineHeight: 1.7,
              fontStyle: 'italic',
            }}
          >
            Il y a eu un incident.
          </p>
          <p
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-base)',
              color: 'var(--color-text)',
              lineHeight: 1.7,
              fontStyle: 'italic',
              fontWeight: 500,
            }}
          >
            Vous étiez là.
          </p>
        </div>

        {/* Séparateur */}
        <div
          aria-hidden
          style={{
            width: '32px',
            height: '1px',
            background: 'var(--color-primary)',
            opacity: 0.5,
          }}
        />

        {/* CTA */}
        <Link
          href="/login"
          style={{
            display: 'inline-block',
            padding: 'var(--space-3) var(--space-10)',
            background: 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            letterSpacing: '0.06em',
            textDecoration: 'none',
            textTransform: 'uppercase',
            transition: 'background var(--transition)',
          }}
        >
          Commencer
        </Link>

        {/* Genre */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-faint)',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
          }}
        >
          Enquête narrative · 6 points de vue · 1 vérité
        </p>
      </div>

      {/* Trait décoratif bas */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          bottom: 'var(--space-12)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1px',
          height: 'var(--space-16)',
          background: 'var(--color-divider)',
        }}
      />
    </main>
  )
}
