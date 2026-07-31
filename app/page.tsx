import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  const session = cookies().get('__session')?.value
  if (session) redirect('/dashboard')

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'grid',
        gridTemplateRows: '1fr auto',
        background: 'var(--color-bg)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Hero image plein écran ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
        }}
      >
        <Image
          src="/logo.png"
          alt="Table dressée pour six — Sous la nappe"
          fill
          priority
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
            filter: 'brightness(0.45) saturate(0.85)',
          }}
        />
        {/* Dégradé bas pour lisibilité du texte */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, transparent 30%, rgba(13,11,10,0.6) 65%, rgba(13,11,10,0.95) 100%)',
          }}
        />
        {/* Dégradé haut léger */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(to bottom, rgba(13,11,10,0.35) 0%, transparent 25%)',
          }}
        />
      </div>

      {/* ── Contenu ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          padding: 'var(--space-16) var(--space-8) var(--space-24)',
          textAlign: 'center',
          gap: 'var(--space-6)',
        }}
      >
        {/* Titre */}
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(3rem, 8vw, 6rem)',
            color: '#f5f3ee',
            fontWeight: 400,
            fontStyle: 'italic',
            letterSpacing: '0.02em',
            lineHeight: 1.05,
            textShadow: '0 2px 32px rgba(0,0,0,0.6)',
          }}
        >
          Sous la nappe
        </h1>

        {/* Accroche */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-base)',
            color: 'rgba(212, 207, 200, 0.85)',
            lineHeight: 1.8,
            fontStyle: 'italic',
            maxWidth: '38ch',
          }}
        >
          Il y a eu un dîner. Il y a eu un incident.<br />
          <span style={{ color: '#f5f3ee', fontWeight: 500 }}>Vous étiez là.</span>
        </p>

        {/* Séparateur */}
        <div
          aria-hidden
          style={{
            width: '40px',
            height: '1px',
            background: '#8b1a1a',
            opacity: 0.8,
          }}
        />

        {/* CTA */}
        <Link
          href="/login?next=/dashboard"
          style={{
            display: 'inline-block',
            padding: 'var(--space-4) var(--space-12)',
            background: '#8b1a1a',
            color: '#f5f3ee',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            letterSpacing: '0.1em',
            textDecoration: 'none',
            textTransform: 'uppercase',
            boxShadow: '0 0 32px rgba(139, 26, 26, 0.4)',
            transition: 'all var(--transition)',
          }}
        >
          Commencer
        </Link>

        {/* Sous-titre discret */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'rgba(176, 170, 159, 0.5)',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}
        >
          Enquête narrative · 6 points de vue · 1 vérité
        </p>
      </div>
    </main>
  )
}
