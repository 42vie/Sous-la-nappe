'use client'

// Le Manuscrit — la vérité canonique se complète au fil des indices trouvés.
import { getManuscriptStatus } from '@/lib/engine/manuscript'
import type { RunState } from '@/types'

interface ManuscriptPanelProps {
  state: RunState
}

const STATUS_LABEL: Record<string, string> = {
  locked: 'Non éclairci',
  partial: 'Partiel',
  complete: 'Établi',
}

export function ManuscriptPanel({ state }: ManuscriptPanelProps) {
  const entries = getManuscriptStatus(state)
  const completeCount = entries.filter((e) => e.status === 'complete').length

  return (
    <div>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-faint)',
        marginBottom: 'var(--space-4)',
      }}>
        {completeCount} / {entries.length} vérités établies
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        {entries.map((entry) => (
          <div
            key={entry.id}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              background: entry.status === 'complete' ? 'var(--color-primary-highlight)' : 'var(--color-surface)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-1)' }}>
              <span style={{
                fontFamily: 'var(--font-body)', fontSize: '10px', textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: entry.status === 'complete' ? 'var(--color-primary)' : 'var(--color-text-faint)',
              }}>
                {STATUS_LABEL[entry.status]}
              </span>
              {entry.status === 'partial' && (
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '10px', color: 'var(--color-text-faint)' }}>
                  {Math.round(entry.progress * 100)}%
                </span>
              )}
            </div>
            <p style={{
              fontFamily: entry.status === 'complete' ? 'var(--font-display)' : 'var(--font-body)',
              fontStyle: entry.status === 'complete' ? 'italic' : 'normal',
              fontSize: entry.status === 'complete' ? 'var(--text-sm)' : 'var(--text-xs)',
              color: entry.status === 'locked' ? 'var(--color-text-faint)' : 'var(--color-text-muted)',
              lineHeight: 1.6,
            }}>
              {entry.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
