import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Optimisation des images
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  // Variables d'environnement exposées au client
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  },
}

export default nextConfig
