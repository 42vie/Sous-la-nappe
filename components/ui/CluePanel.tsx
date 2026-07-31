'use client'

import type { ClueId } from '@/lib/types/clues'

const CLUES_DATA: Record<string, { label: string; reliability: string; misleads: string }> = {
  'C-01': { label: "Message d'invitation de Noé, plus long que les autres", reliability: 'haute', misleads: "Qu'elle allait mal" },
  'C-02': { label: 'Boîtes de traitement périmées, sans étiquette récente', reliability: 'haute', misleads: 'Négligence de rangement' },
  'C-03': { label: 'Une seule photo laissée visible dans le couloir', reliability: 'faible', misleads: 'Nostalgie, difficulté à tourner la page' },
  'C-05': { label: 'Phrase répétée à voix haute à l\'étage à 17h05', reliability: 'moyenne', misleads: "Qu'elle était au téléphone" },
  'C-07': { label: 'Maëlys rétablit le plan de table quand Noé s\'assoit ailleurs', reliability: 'faible', misleads: "Maniaquerie d'hôte" },
  'C-09': { label: 'Petit récipient en grès ébréché derrière la boîte à sel', reliability: 'haute', misleads: 'Rien du tout, sur le moment' },
  'C-11': { label: 'Reflet dans la vitre du cellier', reliability: 'moyenne', misleads: "Qu'elle rajoutait de la sauce" },
  'C-14': { label: 'La phrase dite en voiture le 30 sept.', reliability: 'faible', misleads: "Une façon de parler" },
  'C-15': { label: 'Trace/goutte sur le bord d\'une assiette', reliability: 'moyenne', misleads: 'Service fait à la hâte' },
  'C-18': { label: 'Absence du pilulier de Sarah dans son sac', reliability: 'haute', misleads: "Qu'elle a arrêté volontairement" },
  'C-19': { label: 'Photo de table horodatée 21h47', reliability: 'tres_haute', misleads: 'Un souvenir de soirée' },
  'C-20': { label: 'Message vocal de Maëlys, 48 s, printemps', reliability: 'haute', misleads: 'Mobile ou circonstance atténuante' },
  'C-22': { label: 'Page à demi arrachée du carnet, lisible à contre-jour', reliability: 'tres_haute', misleads: 'Journal intime de rupture' },
  'C-23': { label: 'Fil de messages supprimé la veille à 23h40', reliability: 'haute', misleads: 'Que Noé cache un rapport à l\'argent' },
  'C-25': { label: 'L\'ordre des trois phrases de Noé après l\'incident', reliability: 'haute', misleads: 'Du bon sens, de la responsabilité' },
}

const RELIABILITY_COLORS: Record<string, string> = {
  faible: 'var(--color-text-faint)',
  moyenne: 'var(--color-warning)',
  haute: 'var(--color-success)',
  tres_haute: 'var(--color-primary)',
}

interface CluePanelProps {
  discoveredClues: string[]
}

export function CluePanel({ discoveredClues }: CluePanelProps) {
  if (discoveredClues.length === 0) {
    return (
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-faint)',
        fontStyle: 'italic',
        padding: 'var(--space-4)',
      }}>
        Aucun indice découvert pour l'instant.
      </p>
    )
  }

  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {discoveredClues.map((ref) => {
        const clue = CLUES_DATA[ref]
        if (!clue) return null
        const color = RELIABILITY_COLORS[clue.reliability] ?? 'var(--color-text-muted)'
        return (
          <li
            key={ref}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              borderLeft: `3px solid ${color}`,
            }}
          >
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text)',
              marginBottom: 'var(--space-1)',
            }}>
              <span style={{ color, fontWeight: 500 }}>{ref}</span>{' — '}{clue.label}
            </p>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--color-text-faint)',
              fontStyle: 'italic',
            }}>
              Première impression : {clue.misleads}
            </p>
          </li>
        )
      })}
    </ul>
  )
}
