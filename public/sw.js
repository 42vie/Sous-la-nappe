// Service worker minimal — installabilité PWA + cache de l'app shell statique.
// Ne met jamais en cache les appels API ni les pages de run (état de jeu
// vivant côté Firestore) : cache-first uniquement pour les assets statiques.
const CACHE_NAME = 'sous-la-nappe-v1'
const APP_SHELL = [
  '/manifest.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  // Jamais l'API ni les pages dynamiques : toujours le réseau, état de jeu vivant.
  if (url.pathname.startsWith('/api/')) return

  // Assets statiques connus : cache d'abord, réseau en repli.
  if (APP_SHELL.includes(url.pathname) || url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    )
  }
})
