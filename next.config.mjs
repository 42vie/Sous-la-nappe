/** @type {import('next').NextConfig} */
const nextConfig = {
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
