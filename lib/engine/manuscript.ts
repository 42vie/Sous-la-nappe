// Le Manuscrit — la vérité canonique (chapitre 2 de la bible) se complète
// au fil de la partie, selon les indices trouvés et leur fiabilité, ou
// selon la progression de la partie pour les points structurels que
// personne ne peut vraiment "prouver" par un objet.
import type { RunState } from '@/types'
import type { ClueId } from '@/lib/types/clues'

// Poids de fiabilité — faible/moyenne/haute/très haute (data/clues.json)
const CLUE_WEIGHT: Partial<Record<ClueId, number>> = {
  'C-03': 1,
  'C-07': 1,
  'C-09': 3,
  'C-11': 2,
  'C-15': 2,
  'C-20': 3,
  'C-22': 4,
  'C-25': 3,
}

export type ManuscriptStatus = 'locked' | 'partial' | 'complete'

export interface ManuscriptEntry {
  id: string
  /** Version floue, toujours visible — ce qu'on sait avant d'avoir la preuve */
  teaser: string
  /** Texte canonique complet (chapitre 2 de la bible), révélé une fois assez de preuves réunies */
  truth: string
  requiredClues?: ClueId[]
  /** Condition structurelle alternative (ou complémentaire) aux indices */
  structuralCheck?: (state: RunState) => boolean
}

const ENTRIES: ManuscriptEntry[] = [
  {
    id: 'faux_pretexte',
    teaser: "Le dîner a été présenté comme une soirée de réconciliation. Quelque chose dans la mise en scène ne colle pas tout à fait.",
    truth: "Maëlys Renaud a organisé ce dîner sous un faux prétexte. Le prétexte annoncé — tourner la page, se reparler, annoncer un nouveau départ — est un mensonge conscient, écrit et relu avant envoi.",
    requiredClues: ['C-03', 'C-22'],
  },
  {
    id: 'intention_avant_arrivee',
    teaser: "Ce qui s'est passé ce soir ne s'est pas décidé ce soir. Il y a un avant à cette histoire.",
    truth: "L'intention punitive existait avant l'arrivée du premier invité. Elle est datée : elle se forme entre le 2 et le 9 octobre, elle se matérialise le 11 octobre entre 15h20 et 17h05.",
    requiredClues: ['C-22', 'C-20'],
  },
  {
    id: 'vecteur_prepare',
    teaser: "Quelque chose a été préparé en cuisine, avant que quiconque n'arrive. Pas un geste d'impulsion à table.",
    truth: "Un vecteur a été préparé en amont, dans la logique du service. Une préparation faite seule, en cuisine, avant que quiconque n'arrive.",
    requiredClues: ['C-09', 'C-11'],
  },
  {
    id: 'cible_precise',
    teaser: "Ce n'était pas un geste au hasard. Quelqu'un de précis était visé — et ce n'était pas elle.",
    truth: "La cible pensée par Maëlys est une personne précise, et ce n'est pas Sarah.",
    structuralCheck: (state) => state.visitedScenes.includes('scene_08_critical_service'),
  },
  {
    id: 'perte_de_controle',
    teaser: "Elle avait tout organisé, jusqu'au moindre détail du service. Et pourtant, quelque chose lui a échappé.",
    truth: "Maëlys perd le contrôle de son propre plan au moment du service. Ce n'est pas un accident du hasard : c'est une faute de conception, et elle en est l'auteure.",
    requiredClues: ['C-07', 'C-15'],
  },
  {
    id: 'temoin_silencieux',
    teaser: "Quelqu'un, dans cette maison, a vu un fragment de ce qui s'est passé. Et n'a rien dit.",
    truth: "Au moins une personne voit un fragment du geste critique et ne parle pas dans l'heure. L'identité varie, le fait ne varie pas.",
    requiredClues: ['C-11'],
    structuralCheck: (state) => Boolean(state.variable.witnessOfCriticalMove),
  },
  {
    id: 'sarah_atteinte',
    teaser: "Quelqu'un a mal tourné, ce soir-là.",
    truth: "Sarah Kessler est atteinte dans toutes les branches. Elle n'était visée par personne.",
    structuralCheck: (state) => state.visitedScenes.includes('scene_09_incident'),
  },
  {
    id: 'recit_fabrique',
    teaser: "Ce qui s'est dit après n'est pas exactement ce qui s'est passé. Quelqu'un a choisi l'ordre des mots.",
    truth: "Un récit collectif est fabriqué avant l'arrivée des secours ou dans les heures qui suivent. Il n'est jamais totalement faux et jamais totalement vrai. Il est toujours plus confortable que les faits.",
    requiredClues: ['C-25'],
  },
  {
    id: 'personne_vision_complete',
    teaser: "Chacun n'a vu qu'un fragment de cette soirée.",
    truth: "Personne, dans cette maison, n'a une vision complète de la soirée. L'écran final ne restitue pas « la vérité » : il restitue l'écart entre trois objets — ce qui était prévu, ce qui s'est produit, ce qui a été dit.",
    structuralCheck: (state) => (state.povHistory?.length ?? 1) >= 2,
  },
]

export interface ManuscriptEntryStatus {
  id: string
  text: string
  status: ManuscriptStatus
  progress: number // 0–1
}

/** Version "aucune partie en cours" — tout est verrouillé, pour l'accueil avant la première partie */
export function getEmptyManuscriptStatus(): ManuscriptEntryStatus[] {
  return ENTRIES.map((entry) => ({ id: entry.id, text: entry.teaser, status: 'locked' as const, progress: 0 }))
}

export function getManuscriptStatus(state: RunState): ManuscriptEntryStatus[] {
  const discovered = new Set(state.discoveredClues.map((dc) => dc.clueId))

  return ENTRIES.map((entry) => {
    const required = entry.requiredClues ?? []
    const totalWeight = required.reduce((sum, id) => sum + (CLUE_WEIGHT[id] ?? 1), 0)
    const foundWeight = required.reduce(
      (sum, id) => sum + (discovered.has(id) ? (CLUE_WEIGHT[id] ?? 1) : 0),
      0
    )
    const clueProgress = totalWeight > 0 ? foundWeight / totalWeight : 1
    const clueConditionMet = required.length === 0 || clueProgress >= 1
    const structuralMet = entry.structuralCheck ? entry.structuralCheck(state) : true

    // Complet si toutes les preuves matérielles requises sont réunies (s'il y
    // en a) ET la condition structurelle est vérifiée (s'il y en a une).
    const complete = clueConditionMet && structuralMet
    const progress = complete
      ? 1
      : Math.max(required.length > 0 ? clueProgress * 0.8 : 0, structuralMet ? 0.4 : 0)

    return {
      id: entry.id,
      text: complete ? entry.truth : entry.teaser,
      status: complete ? 'complete' : progress > 0 ? 'partial' : 'locked',
      progress,
    }
  })
}
