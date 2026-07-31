import type { Metadata } from 'next'
import { Providers } from '@/components/providers'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sous la nappe',
  description:
    'Jeu narratif d\'enquête psychologique à embranchements · 6 personnages jouables · 1 dîner',
  keywords: ['jeu narratif', 'enquête', 'interactif', 'fiction'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
