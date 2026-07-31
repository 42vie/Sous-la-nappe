// Gestion des flags narratifs
import type { RunState } from '@/types'

// Flags produits par chaque phase du passé (chapitre 3)
export const BACKGROUND_FLAGS = [
  // Phase 1
  'groupe_mythe_actif',
  'lucas_role_confident',
  'ines_admiration_maelys',
  // Phase 2
  'maison_titre_noe_seul',
  'maelys_preuves_financieres',
  'maelys_investissement_invisible',
  // Phase 3
  'lucas_savait_dettes',
  'ines_intrusion_telephone',
  'ines_participation_vente',
  'noe_dettes_dissimulees',
  // Phase 4
  'maelys_invalidation_publique',
  'sarah_episode_hiver',
  'noe_sarah_messages_nuit',
  'maelys_soin_sarah',
  // Phase 5
  'maelys_a_vu_captures',
  'maelys_a_vu_messages',
  'lucas_detient_vocal',
  'sarah_silence_coupable',
  'noe_promesses_non_tenues',
  // Phase 6
  'vente_engagee',
  'yanis_version_edulcoree',
  'invitation_faux_pretexte',
] as const

export type BackgroundFlag = typeof BACKGROUND_FLAGS[number]

/** Vérifier si un flag est actif dans le run */
export function hasFlag(state: RunState, flag: string): boolean {
  return Boolean(state.flags[flag])
}

/** Initialiser les flags de fond pour un nouveau run */
export function initBackgroundFlags(): Record<string, boolean> {
  return BACKGROUND_FLAGS.reduce((acc, flag) => {
    acc[flag] = true
    return acc
  }, {} as Record<string, boolean>)
}
