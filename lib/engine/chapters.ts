// Découpage en 4 chapitres — un personnage différent par chapitre.
// Les 11 scènes existantes ne changent pas ; seul le regroupement et le
// choix du POV à chaque frontière de chapitre sont nouveaux.
import type { SceneId } from '@/lib/types/scenes'

export interface ChapterDef {
  id: number // 1 à 4
  title: string
  sceneIds: SceneId[]
}

export const CHAPTERS: ChapterDef[] = [
  {
    id: 1,
    title: 'Avant le service',
    sceneIds: ['scene_01_opening_memory', 'scene_02_arrival', 'scene_03_first_exchanges'],
  },
  {
    id: 2,
    title: 'La table se met en place',
    sceneIds: ['scene_04_seating', 'scene_05_social_game_1', 'scene_06_kitchen_aside'],
  },
  {
    id: 3,
    title: 'Le service critique',
    sceneIds: ['scene_07_social_game_2', 'scene_08_critical_service', 'scene_09_incident'],
  },
  {
    id: 4,
    title: 'Ce qui reste',
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
