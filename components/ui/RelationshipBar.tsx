'use client'

// Une ligne de la matrice relationnelle. Avant : une barre bidirectionnelle
// sans repère de zéro, sans échelle — impossible de savoir d'un coup d'œil
// si "40" est fort ou faible, ni où se trouve le neutre. Ici : un repère
// central visible, une échelle "hostile ↔ loyal" fixe aux deux bouts, et un
// emoji + libellé qualitatif en plus du nombre.

import { relationshipEmoji, relationshipLabel } from '@/lib/engine/backstory'

interface RelationshipBarProps {
  firstName: string
  value: number
  note?: string
}

export function RelationshipBar({ firstName, value, note }: RelationshipBarProps) {
  const positive = value >= 0
  const magnitude = Math.min(100, Math.abs(value))
  const color = positive ? 'var(--color-primary)' : 'var(--color-error, #a01f1f)'

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 'var(--space-2)', marginBottom: '3px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'var(--font-body)', fontSize: 'var(--text-xs)', color: 'var(--color-text)' }}>
          <span aria-hidden="true">{relationshipEmoji(value)}</span>
          <span>→ {firstName}</span>
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color, fontWeight: 600, textAlign: 'right' }}>
          {relationshipLabel(value)}{note ? ` · ${note}` : ''}
        </span>
      </div>
      <div style={{ position: 'relative', height: 6, background: 'var(--color-surface)', borderRadius: 999, overflow: 'hidden' }}>
        {/* Repère du neutre (zéro), toujours visible */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: 1,
          background: 'var(--color-border)',
          zIndex: 1,
        }} />
        <div style={{
          position: 'absolute',
          left: positive ? '50%' : `${50 - magnitude / 2}%`,
          width: `${magnitude / 2}%`,
          height: '100%',
          background: color,
          transition: 'width var(--transition), left var(--transition)',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--color-text-faint)' }}>hostile</span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '9px', color: 'var(--color-text-faint)' }}>loyal</span>
      </div>
    </div>
  )
}
