import type { Metadata, Viewport } from 'next'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { Providers } from '@/components/providers'
import { PwaRegister } from '@/components/PwaRegister'
import './globals.css'

export const metadata: Metadata = {
  title: 'Sous la nappe',
  description:
    'Jeu narratif d\'enquête psychologique à embranchements · 6 personnages jouables · 1 dîner',
  keywords: ['jeu narratif', 'enquête', 'interactif', 'fiction'],
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Sous la nappe',
  },
  openGraph: {
    title: 'Sous la nappe',
    description: 'Jeu narratif d\'enquête psychologique',
    images: [{ url: '/logo.png', width: 800, height: 800 }],
  },
}

export const viewport: Viewport = {
  themeColor: '#100e0c',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" data-theme="dark" suppressHydrationWarning>
      <body>
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
        <PwaRegister />
      </body>
    </html>
  )
}
