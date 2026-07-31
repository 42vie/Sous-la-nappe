// Page d'accueil du jeu — sélection du personnage
export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
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
          textAlign: 'center',
          maxWidth: '48ch',
          marginBottom: 'var(--space-12)',
          lineHeight: '1.7',
        }}
      >
        Jeu narratif d&apos;enquête psychologique &middot; 6 personnages jouables &middot; 1 dîner
      </p>

      {/* Placeholder — à remplacer par le composant CharacterSelector */}
      <p style={{ color: 'var(--color-text-faint)', fontSize: 'var(--text-xs)' }}>
        Sélection du personnage — à implémenter
      </p>
    </main>
  )
}
