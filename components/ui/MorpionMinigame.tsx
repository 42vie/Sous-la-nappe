'use client'

/**
 * MorpionMinigame — Scène 5 : pivot causal du drame
 * Sarah vs Yanis. Si Sarah perd → serviceHelper = 'sarah' (run T0 canonique).
 * Le joueur (Lucas, POV) observe uniquement — c'est le résultat qui compte.
 */

import { useState, useCallback } from 'react'
import type { CharacterId } from '@/lib/types/characters'

type Board = (CharacterId | null)[]
type Mark = 'X' | 'O'

const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
]

function checkWinner(board: Board, players: [CharacterId, CharacterId]): CharacterId | 'draw' | null {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as CharacterId
    }
  }
  if (board.every(Boolean)) return 'draw'
  return null
}

function aiMove(board: Board, aiChar: CharacterId): number {
  // Jouer la case centrale si libre
  if (!board[4]) return 4
  // Chercher une victoire immédiate ou bloquer
  for (const [a, b, c] of WINNING_LINES) {
    const line = [board[a], board[b], board[c]]
    const aiCount = line.filter((x) => x === aiChar).length
    const emptyIdx = [a, b, c].find((i) => !board[i])
    if (aiCount === 2 && emptyIdx !== undefined) return emptyIdx
  }
  // Jouer un coin libre
  const corners = [0, 2, 6, 8].filter((i) => !board[i])
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)]
  // Jouer n'importe quelle case libre
  const free = board.map((_, i) => i).filter((i) => !board[i])
  return free[Math.floor(Math.random() * free.length)]
}

function label(id: CharacterId): string {
  return id.charAt(0).toUpperCase() + id.slice(1)
}

interface MorpionMinigameProps {
  players: [CharacterId, CharacterId] // [0] = X (joue en premier), [1] = O
  playerPov: CharacterId
  onComplete: (result: { winner: CharacterId | null; serviceHelper: CharacterId }) => void
}

export function MorpionMinigame({ players, playerPov, onComplete }: MorpionMinigameProps) {
  const [sarah, yanis] = players as [CharacterId, CharacterId]
  // La partie oppose toujours Sarah et Yanis (canon T0). Le joueur humain
  // contrôle son propre personnage s'il est l'un des deux protagonistes ;
  // sinon (les 4 autres POV, qui observent la scène) il contrôle Sarah,
  // dont le résultat de cette partie est le pivot causal du drame.
  const playerChar = playerPov === yanis ? yanis : sarah
  const aiChar = playerChar === sarah ? yanis : sarah

  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [currentTurn, setCurrentTurn] = useState<CharacterId>(playerChar)
  const [winner, setWinner] = useState<CharacterId | 'draw' | null>(null)
  const [resultSent, setResultSent] = useState(false)

  const CHAR_MARK: Record<CharacterId, Mark> = {
    [playerChar]: 'X',
    [aiChar]: 'O',
  } as Record<CharacterId, Mark>

  const handleCellClick = useCallback(
    (idx: number) => {
      if (board[idx] || winner || currentTurn !== playerChar) return

      const newBoard: Board = [...board]
      newBoard[idx] = playerChar

      const w = checkWinner(newBoard, players)
      setBoard(newBoard)

      if (w) {
        setWinner(w)
        return
      }

      // Tour de l'IA
      setCurrentTurn(aiChar)
      setTimeout(() => {
        const aiIdx = aiMove(newBoard, aiChar)
        const boardAfterAI: Board = [...newBoard]
        boardAfterAI[aiIdx] = aiChar
        const w2 = checkWinner(boardAfterAI, players)
        setBoard(boardAfterAI)
        if (w2) {
          setWinner(w2)
        } else {
          setCurrentTurn(playerChar)
        }
      }, 450)
    },
    [board, winner, currentTurn, playerChar, aiChar, players]
  )

  function handleConfirm() {
    if (resultSent) return
    setResultSent(true)
    // Le perdant (ou en cas d'égalité, Sarah — canon T0) sert les assiettes.
    const serviceHelper: CharacterId =
      winner === 'draw' ? sarah : winner === sarah ? yanis : sarah
    onComplete({ winner: winner === 'draw' ? null : winner as CharacterId, serviceHelper })
  }

  const statusText = winner
    ? winner === 'draw'
      ? `Égalité — ${label(sarah)} servira quand même.`
      : winner === sarah
        ? `${label(sarah)} gagne — ${label(yanis)} servira.`
        : `${label(yanis)} gagne — ${label(sarah)} servira.`
    : `À ${label(currentTurn)} de jouer`

  return (
    <div style={{
      width: '100%',
      maxWidth: 320,
      margin: '0 auto',
      padding: 'var(--space-6)',
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
    }}>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-xs)',
        color: 'var(--color-text-faint)',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        textAlign: 'center',
        marginBottom: 'var(--space-2)',
      }}>
        Mini-jeu — Qui sert ?
      </p>
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        color: 'var(--color-text-muted)',
        textAlign: 'center',
        marginBottom: 'var(--space-6)',
        fontStyle: 'italic',
      }}>
        {label(playerChar)} ({CHAR_MARK[playerChar]}) vs {label(aiChar)} ({CHAR_MARK[aiChar]}). Celui qui perd sert les assiettes.
      </p>

      {/* Grille */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--space-2)',
        marginBottom: 'var(--space-4)',
      }}>
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleCellClick(idx)}
            disabled={!!cell || !!winner || currentTurn !== playerChar}
            style={{
              height: 64,
              background: cell
                ? (cell === playerChar ? 'var(--color-primary-highlight)' : 'var(--color-surface-offset)')
                : 'var(--color-surface-offset)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-display)',
              fontSize: 'var(--text-xl)',
              color: cell === playerChar ? 'var(--color-primary)' : 'var(--color-text-muted)',
              cursor: !cell && !winner && currentTurn === playerChar ? 'pointer' : 'default',
              transition: 'all var(--transition)',
            }}
          >
            {cell ? CHAR_MARK[cell] ?? '?' : ''}
          </button>
        ))}
      </div>

      {/* Statut */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        color: winner ? 'var(--color-text)' : 'var(--color-text-faint)',
        textAlign: 'center',
        marginBottom: 'var(--space-4)',
        minHeight: '1.5em',
      }}>
        {statusText}
      </p>

      {/* Confirmer le résultat */}
      {winner && !resultSent && (
        <button
          onClick={handleConfirm}
          style={{
            width: '100%',
            padding: 'var(--space-3) var(--space-6)',
            background: 'var(--color-primary)',
            color: 'var(--color-text-inverse)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-sm)',
            letterSpacing: '0.04em',
            cursor: 'pointer',
          }}
        >
          Continuer →
        </button>
      )}
    </div>
  )
}
