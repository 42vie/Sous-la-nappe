'use client'

import { useEffect, useState } from 'react'

type ImageSlotMode = 'fill' | 'banner'

interface ImageSlotProps {
  src: string
  alt: string
  /**
   * 'fill' (défaut) : calque plein cadre en absolute inset:0 — le parent a
   * déjà sa propre taille (ex. la zone portrait de CharacterCard).
   * 'banner' : le composant gère lui-même sa taille via aspectRatio — pour
   * un emplacement qui n'existe QUE pour porter l'image (bannière de scène).
   */
  mode?: ImageSlotMode
  aspectRatio?: string
  /** Dégradé sombre en bas, pour garder du contraste au-dessus de l'image. */
  scrim?: boolean
  style?: React.CSSProperties
}

/**
 * Emplacement d'illustration à repli totalement silencieux. Les 35 visuels
 * décrits dans docs/prompts-visuels.md ne sont pas encore générés — voir
 * docs/images-manifest.md pour les chemins exacts à utiliser une fois
 * qu'ils le sont.
 *
 * Le chargement est sondé en arrière-plan (une Image() jamais insérée dans
 * le DOM) avant de rendre quoi que ce soit : tant que le fichier n'existe
 * pas, RIEN n'apparaît — ni icône d'image cassée, ni bloc vide qui
 * réserverait de l'espace avant de s'effondrer. Dès qu'un fichier est
 * déposé au bon chemin, il apparaît automatiquement, sans changement de code.
 */
export function ImageSlot({ src, alt, mode = 'fill', aspectRatio = '16 / 9', scrim = false, style }: ImageSlotProps) {
  const [ok, setOk] = useState(false)

  useEffect(() => {
    setOk(false)
    let cancelled = false
    const img = new window.Image()
    img.onload = () => { if (!cancelled) setOk(true) }
    img.onerror = () => { if (!cancelled) setOk(false) }
    img.src = src
    return () => { cancelled = true }
  }, [src])

  if (!ok) return null

  const scrimEl = scrim && (
    <div aria-hidden style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.55) 100%)',
    }} />
  )

  if (mode === 'banner') {
    return (
      <div style={{
        position: 'relative', width: '100%', aspectRatio,
        borderRadius: 'var(--radius-lg)', overflow: 'hidden', ...style,
      }}>
        <img src={src} alt={alt} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        {scrimEl}
      </div>
    )
  }

  return (
    <>
      <img
        src={src}
        alt={alt}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', ...style }}
      />
      {scrimEl}
    </>
  )
}
