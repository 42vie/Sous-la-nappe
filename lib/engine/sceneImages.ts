// Association scène → illustration bannière, alignée sur les prompts de
// docs/prompts-visuels.md (moments narratifs en priorité, décor de pièce en
// repli). Les chemins pointent vers des fichiers qui n'existent pas encore
// — voir docs/images-manifest.md pour la liste complète à générer et
// déposer dans public/images/. Tant qu'un fichier est absent, ImageSlot ne
// rend rien : aucune scène n'affiche d'image cassée en attendant.
import type { SceneId } from '@/lib/types/scenes'

export const SCENE_IMAGE: Partial<Record<SceneId, string>> = {
  scene_02_arrival: '/images/rooms/couloir.jpg',
  scene_03_first_exchanges: '/images/rooms/salon.jpg',
  scene_04_seating: '/images/moments/mise-a-table.jpg',
  scene_05_social_game_1: '/images/moments/minijeu-social.jpg',
  scene_06_kitchen_aside: '/images/moments/reflet-cuisine.jpg',
  scene_07_social_game_2: '/images/moments/minijeu-social.jpg',
  scene_08_critical_service: '/images/moments/service-critique.jpg',
  scene_09_incident: '/images/moments/incident.jpg',
  scene_10_aftermath: '/images/moments/apres-coup.jpg',
  scene_11_reconstruction: '/images/rooms/salle-a-manger.jpg',
}
