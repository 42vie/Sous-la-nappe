// Traduction visuelle de socialTension en ambiance ressentie — le joueur
// voyait déjà les choix se brouiller sous forte tension (overheard.ts), mais
// rien ne changeait dans la scène elle-même. Ici : les bougies de la table
// s'éteignent une à une, et le texte se resserre à mesure que la soirée se
// tend (docs/expansion-v4-mecanismes-suspense-fins-noires.md, volet A1).
export type TensionTier = 'calm' | 'warning' | 'critical'

export function tensionTier(tension: number): TensionTier {
  if (tension >= 70) return 'critical'
  if (tension >= 50) return 'warning'
  return 'calm'
}

/** 3 bougies sur la table, qui s'éteignent une à une avec la tension. */
export function candlesLit(tension: number): number {
  if (tension >= 80) return 0
  if (tension >= 55) return 1
  if (tension >= 30) return 2
  return 3
}

// Scènes où un temps mort forcé a du sens dramatiquement — juste avant que
// la mécanique n'aille au bout. Se déclenche une seule fois par scène
// traversée, seulement si la tension a déjà bien monté.
export const SILENCE_SCENES = ['scene_08_critical_service', 'scene_09_incident'] as const

export const SILENCE_THRESHOLD = 60

export function shouldTriggerSilence(sceneId: string, tension: number): boolean {
  return (SILENCE_SCENES as readonly string[]).includes(sceneId) && tension >= SILENCE_THRESHOLD
}

export const SILENCE_TEXT = "La table est silencieuse.\n\nTu connais ce silence. C'est celui des situations où quelqu'un devrait parler, et où personne ne le fait.\n\nTu ne le feras pas non plus. Pas encore."

/**
 * Traduit le delta de tension d'un choix en une ligne qualitative — pour
 * que le joueur comprenne POURQUOI la jauge bouge, pas juste qu'elle bouge.
 * null sous le seuil : les petites variations ne méritent pas de commentaire,
 * ça deviendrait du bruit après le 3e choix.
 */
export function tensionDeltaNote(delta: number): string | null {
  if (delta >= 10) return 'La tension vient de monter, nettement.'
  if (delta >= 5) return 'La tension monte d’un cran.'
  if (delta <= -10) return 'Un vrai calme redescend sur la table.'
  if (delta <= -5) return 'Un peu de calme revient.'
  return null
}
