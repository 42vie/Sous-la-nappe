'use client'

import { useRef, useState } from 'react'

interface CardCarouselCard {
  key: string
  content: React.ReactNode
}

interface CardCarouselProps {
  cards: CardCarouselCard[]
}

/**
 * Bande de cartes défilable horizontalement (scroll-snap natif — pas de
 * librairie), avec des points de position cliquables. Remplace un long
 * empilement vertical par des cartes qu'on parcourt une à une, sur mobile
 * comme au clavier/souris (drag natif du navigateur).
 */
export function CardCarousel({ cards }: CardCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  function handleScroll() {
    const el = trackRef.current
    if (!el || cards.length === 0) return
    const cardWidth = el.scrollWidth / cards.length
    const idx = Math.round(el.scrollLeft / cardWidth)
    setActive(Math.max(0, Math.min(cards.length - 1, idx)))
  }

  function scrollTo(idx: number) {
    const el = trackRef.current
    if (!el || cards.length === 0) return
    const cardWidth = el.scrollWidth / cards.length
    el.scrollTo({ left: cardWidth * idx, behavior: 'smooth' })
  }

  if (cards.length === 0) return null

  return (
    <div style={{ width: '100%' }}>
      <div
        ref={trackRef}
        onScroll={handleScroll}
        className="no-scrollbar"
        style={{
          display: 'flex',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          gap: 'var(--space-4)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {cards.map((c) => (
          <div
            key={c.key}
            style={{
              flex: '0 0 min(90vw, 440px)',
              scrollSnapAlign: 'start',
              scrollSnapStop: 'always',
            }}
          >
            {c.content}
          </div>
        ))}
      </div>

      {cards.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
          {cards.map((c, i) => (
            <button
              key={c.key}
              onClick={() => scrollTo(i)}
              aria-label={`Aller à la carte ${i + 1}`}
              style={{
                width: i === active ? 20 : 6,
                height: 6,
                borderRadius: 999,
                background: i === active ? 'var(--color-primary)' : 'var(--color-border)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 220ms ease',
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
