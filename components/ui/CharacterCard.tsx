'use client'

import { ImageSlot } from './ImageSlot'
import type { CharacterId } from '@/lib/types/characters'

interface CharacterDef {
  id: CharacterId
  firstName: string
  accroche: string
  color: string        // couleur signature hex
  initial: string
  // SVG path de silhouette — dessiné sur 48×48, centré
  silhouettePath: string
}

export const CHARACTERS: CharacterDef[] = [
  {
    id: 'maelys',
    firstName: 'Maëlys',
    accroche: 'Elle a tout organisé.',
    color: '#8b1a1a',
    initial: 'M',
    // Silhouette femme — chignon haut, robe évasée
    silhouettePath:
      'M24 4 C21 4 19 6.5 19 9.5 C19 12.5 21 15 24 15 C27 15 29 12.5 29 9.5 C29 6.5 27 4 24 4Z ' +
      'M20 16 C16 17 14 20 14 24 L14 32 L17 32 L17 44 L31 44 L31 32 L34 32 L34 24 C34 20 32 17 28 16 ' +
      'C27 18 25.5 19 24 19 C22.5 19 21 18 20 16Z',
  },
  {
    id: 'noe',
    firstName: 'Noé',
    accroche: 'Il arrive en retard.',
    color: '#4a5568',
    initial: 'N',
    // Silhouette homme — col ouvert, épaules larges
    silhouettePath:
      'M24 4 C21 4 19 6.5 19 9.5 C19 12.5 21 15 24 15 C27 15 29 12.5 29 9.5 C29 6.5 27 4 24 4Z ' +
      'M19 16 C15 17 13 21 13 25 L13 33 L17 33 L17 44 L31 44 L31 33 L35 33 L35 25 C35 21 33 17 29 16 ' +
      'C28 18 26 19 24 19 C22 19 20 18 19 16Z',
  },
  {
    id: 'ines',
    firstName: 'Inès',
    accroche: 'Elle regarde son frère.',
    color: '#744210',
    initial: 'I',
    // Silhouette femme — cheveux lâchés, silhouette droite
    silhouettePath:
      'M24 4 C21 4 19 6.5 19 9.5 C19 12.5 21 15 24 15 C27 15 29 12.5 29 9.5 C29 6.5 27 4 24 4Z ' +
      'M17 9 C15 11 15 16 18 18 L18 16 C17.5 17 18 19 24 19 C30 19 30.5 17 30 16 L30 18 C33 16 33 11 31 9Z ' +
      'M20 16 C16 17 14 20 14 24 L14 32 L17 32 L17 44 L31 44 L31 32 L34 32 L34 24 C34 20 32 17 28 16 ' +
      'C27 18 25.5 19.5 24 19.5 C22.5 19.5 21 18 20 16Z',
  },
  {
    id: 'lucas',
    firstName: 'Lucas',
    accroche: 'Il sait déjà trop.',
    color: '#2d6b2d',
    initial: 'L',
    // Silhouette homme — légèrement incliné, observateur
    silhouettePath:
      'M24 4 C21 4 19 6.5 19 9.5 C19 12.5 21 15 24 15 C27 15 29 12.5 29 9.5 C29 6.5 27 4 24 4Z ' +
      'M19 16 C15 17.5 13 21 13 25 L14 33 L17 33 L18 44 L30 44 L31 33 L34 33 L35 25 C35 21 33 17.5 29 16 ' +
      'C28 18 26 19 24 19 C22 19 20 18 19 16Z',
  },
  {
    id: 'sarah',
    firstName: 'Sarah',
    accroche: 'Elle essaie de sourire.',
    color: '#5a3a7e',
    initial: 'S',
    // Silhouette femme — plus fine, légèrement courbée
    silhouettePath:
      'M24 4 C21.5 4 19.5 6.5 19.5 9.5 C19.5 12.5 21.5 15 24 15 C26.5 15 28.5 12.5 28.5 9.5 C28.5 6.5 26.5 4 24 4Z ' +
      'M20.5 16 C16.5 17 14.5 20 14.5 24 L15 32 L18 32 L18 44 L30 44 L30 32 L33 32 L33.5 24 C33.5 20 31.5 17 27.5 16 ' +
      'C26.5 18 25.5 19 24 19 C22.5 19 21.5 18 20.5 16Z',
  },
  {
    id: 'yanis',
    firstName: 'Yanis',
    accroche: 'Il veut que ça aille bien.',
    color: '#1a4a7a',
    initial: 'Y',
    // Silhouette homme — carré, stable
    silhouettePath:
      'M24 4 C21 4 19 6.5 19 9.5 C19 12.5 21 15 24 15 C27 15 29 12.5 29 9.5 C29 6.5 27 4 24 4Z ' +
      'M19 16 C15 17 12 21 12 25 L12 34 L17 34 L17 44 L31 44 L31 34 L36 34 L36 25 C36 21 33 17 29 16 ' +
      'C28 18 26 19 24 19 C22 19 20 18 19 16Z',
  },
]

interface CharacterCardProps {
  character: CharacterDef
  isSelected: boolean
  onClick: () => void
  /** Remplace l'accroche statique — utilisé pour une accroche réactive à l'état de la partie (tension...) */
  accrocheOverride?: string
}

export function CharacterCard({ character, isSelected, onClick, accrocheOverride }: CharacterCardProps) {
  const { firstName, accroche: baseAccroche, color, initial, silhouettePath } = character
  const accroche = accrocheOverride ?? baseAccroche

  return (
    <button
      onClick={onClick}
      style={{
        all: 'unset',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        borderRadius: 'var(--radius-xl)',
        overflow: 'hidden',
        border: `2px solid ${isSelected ? color : 'var(--color-border)'}`,
        background: isSelected ? `${color}12` : 'var(--color-surface)',
        transition: 'all var(--transition)',
        boxShadow: isSelected ? `0 0 0 1px ${color}40, var(--shadow-md)` : 'var(--shadow-sm)',
      }}
    >
      {/* Zone portrait — fond coloré + silhouette SVG */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '3 / 4',
          background: `${color}18`,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Halo de fond */}
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: '30%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60%',
            aspectRatio: '1',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${color}22 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        {/* Initiale en grand en fond — typographique */}
        <span
          aria-hidden
          style={{
            position: 'absolute',
            bottom: '-0.1em',
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(6rem, 18vw, 10rem)',
            fontStyle: 'italic',
            fontWeight: 600,
            lineHeight: 1,
            color: `${color}14`,
            userSelect: 'none',
            letterSpacing: '-0.05em',
            pointerEvents: 'none',
          }}
        >
          {initial}
        </span>

        {/* Silhouette SVG — repli tant que le portrait photo n'existe pas */}
        <svg
          viewBox="0 0 48 48"
          width="70%"
          style={{
            position: 'relative',
            zIndex: 1,
            fill: color,
            opacity: isSelected ? 0.9 : 0.55,
            transition: 'opacity var(--transition)',
            filter: `drop-shadow(0 -4px 16px ${color}30)`,
            marginBottom: '-2px',
          }}
        >
          <path d={silhouettePath} />
        </svg>

        {/* Portrait photo — voir docs/prompts-visuels.md / images-manifest.md. N'apparaît (et ne recouvre la silhouette) qu'une fois le fichier confirmé. */}
        <ImageSlot src={`/images/portraits/${character.id}.jpg`} alt={firstName} scrim style={{ zIndex: 2 }} />

        {/* Bordure bas colorée si sélectionné */}
        {isSelected && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: color,
              zIndex: 3,
            }}
          />
        )}
      </div>

      {/* Zone texte */}
      <div
        style={{
          padding: 'var(--space-4) var(--space-5) var(--space-5)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-2)',
          borderTop: `1px solid ${isSelected ? `${color}30` : 'var(--color-divider)'}`,
        }}
      >
        {/* Prénom */}
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--text-lg)',
            color: isSelected ? color : 'var(--color-text)',
            fontStyle: 'italic',
            lineHeight: 1.1,
            transition: 'color var(--transition)',
          }}
        >
          {firstName}
        </p>

        {/* Accroche */}
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-muted)',
            lineHeight: 1.5,
          }}
        >
          {accroche}
        </p>
      </div>
    </button>
  )
}
