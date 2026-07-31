import { CharacterSelector } from '@/components/ui/CharacterSelector'

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 'var(--space-16) var(--space-8) var(--space-12)',
      }}
    >
      {/* En-tête */}
      <header
        style={{
          textAlign: 'center',
          marginBottom: 'var(--space-12)',
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-3xl)',
            color: 'var(--color-text)',
            marginBottom: 'var(--space-4)',
            letterSpacing: '0.02em',
          }}
        >
          Sous la nappe
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            maxWidth: '52ch',
            margin: '0 auto var(--space-3)',
            lineHeight: '1.7',
          }}
        >
          Jeu narratif d&apos;enquête psychologique &middot; 6 personnages jouables &middot; 1 dîner
        </p>

        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-faint)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          Choisissez votre point de vue
        </p>
      </header>

      {/* Sélecteur de personnage */}
      <CharacterSelector />
    </main>
  )
}
