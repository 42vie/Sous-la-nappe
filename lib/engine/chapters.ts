// Découpage en 4 chapitres — un personnage différent par chapitre.
// Les 11 scènes existantes ne changent pas ; seul le regroupement et le
// choix du POV à chaque frontière de chapitre sont nouveaux.
//
// Titres : repères pour se situer dans la soirée, sans rien spoiler de ce
// qui va s'y passer (pas de "Le drame", pas de "La révélation") — le 4e
// reprend le titre du jeu lui-même, en écho, pour le dernier chapitre.
import type { SceneId } from '@/lib/types/scenes'

export interface ChapterDef {
  id: number // 1 à 4
  title: string
  sceneIds: SceneId[]
}

export const CHAPTERS: ChapterDef[] = [
  {
    id: 1,
    title: 'Sous les sourires',
    sceneIds: [
      'scene_01_opening_memory', 'scene_01b_conversation_palier',
      'scene_02_arrival', 'scene_02b_telephone_yanis',
      'scene_03_first_exchanges', 'scene_03b_confidence_sarah',
    ],
  },
  {
    id: 2,
    title: 'La mise en place',
    sceneIds: [
      'scene_04_seating', 'scene_04b_echange_regards',
      'scene_05_social_game_1', 'scene_05b_remarque_ines',
      'scene_06_kitchen_aside', 'scene_06b_lucas_yanis_dehors',
    ],
  },
  {
    id: 3,
    title: 'Le service',
    sceneIds: [
      'scene_07_social_game_2', 'scene_07b_demande_noe_lucas',
      'scene_08_critical_service',
      'scene_09_incident', 'scene_09b_couloir_incident',
    ],
  },
  {
    id: 4,
    title: 'Sous la nappe',
    sceneIds: ['scene_10_aftermath', 'scene_11_reconstruction'],
  },
]

export const TOTAL_CHAPTERS = CHAPTERS.length

/** Numéro de chapitre (1 à 4) auquel appartient une scène, ou null si inconnue */
export function getChapterForScene(sceneId: string): ChapterDef | null {
  return CHAPTERS.find((c) => c.sceneIds.includes(sceneId as SceneId)) ?? null
}

export function getChapterNumberForScene(sceneId: string): number | null {
  return getChapterForScene(sceneId)?.id ?? null
}
