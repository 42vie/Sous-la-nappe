// Le contexte complet — chapitres 3 et 4 de la bible, jamais exploités en
// jeu jusqu'ici (seul "ce qu'il/elle ne peut pas voir" avait été extrait,
// voir blindSpots.ts). Répond directement à la question centrale que le
// jeu ne posait jamais explicitement : pourquoi Maëlys vise Noé, ce soir-là.
//
// Deux couches :
// - CHARACTER_BIOS : qui est chacun, sa blessure, ce qu'il/elle veut ce
//   soir. Débloqué par personnage une fois qu'on l'a incarné (même moment
//   que les angles morts) — jamais avant, pour ne pas influencer le
//   joueur sur un personnage qu'il n'a pas encore joué.
// - CHRONOLOGY : sept ans, six fractures, du "on se dit tout" jusqu'à
//   l'invitation au faux prétexte. Débloqué progressivement au fil des
//   chapitres joués, pas d'un coup : la phase qui contient le vrai mobile
//   (l'invalidation, phase 4) n'arrive qu'après avoir vu une bonne partie
//   de la soirée, jamais au tout début.
import type { CharacterId } from '@/lib/types/characters'

export interface CharacterBio {
  age: number
  role: string
  identity: string
  wound: string
  wants: string
  secret?: string
}

export const CHARACTER_BIOS: Record<CharacterId, CharacterBio> = {
  maelys: {
    age: 30,
    role: "l'hôte",
    identity: "Scénographe indépendante. Elle passe sa vie à construire des espaces où les gens ressentent ce qu'on a décidé qu'ils ressentiraient — et ce dîner ne fait pas exception : la lumière, les places, l'ordre des plats, tout est pensé.",
    wound: "Elle n'a pas été trahie : elle a été effacée. Cinq ans de vie transformés en données qui n'apparaissent nulle part. Et quand elle l'a dit, on lui a répondu qu'elle exagérait. Sa rage n'est pas chaude, elle est administrative : elle veut faire figurer quelque chose au dossier.",
    wants: "Être crue. Que quelqu'un dise à voix haute, devant les autres, ce qui s'est passé. Le crime est ce qui remplace l'aveu qu'elle n'obtiendra pas.",
  },
  noe: {
    age: 32,
    role: 'le déclencheur',
    identity: "Commercial dans l'événementiel, après une société montée puis liquidée qu'il présente encore comme « une expérience ». Charmant d'une façon qui fatigue quand on le connaît depuis dix ans.",
    wound: "La honte économique. Il a aimé Maëlys réellement et n'a jamais trouvé le moyen de lui dire qu'il n'était pas à la hauteur, parce que le dire aurait été le devenir. Il a menti par confort — jamais par cruauté — ce qui produit exactement les mêmes dégâts avec moins de dignité.",
    wants: "Que ça se passe bien. Littéralement : sortir de cette maison à minuit en ayant l'impression que c'est réglé. Il n'a pas de plan, il a une stratégie d'évitement de trois heures.",
    secret: "Il a effacé, la veille au soir, un fil de messages de février — pas ceux avec Maëlys : ceux avec Sarah. À 23h40, en se disant que c'était « par respect pour tout le monde ».",
  },
  ines: {
    age: 26,
    role: "l'accélérateur",
    identity: "Assistante juridique dans une étude notariale. Précise, rapide, sans patience pour l'approximation affective. Elle a grandi en regardant son frère être aimé pour son charme et a décidé très tôt qu'elle serait aimée pour son utilité.",
    wound: "Personne ne l'a jamais remerciée. Elle a tenu la comptabilité émotionnelle et réelle de sa famille pendant quatre ans, seule, en silence, et le seul retour qu'elle a reçu est d'être décrite comme dure.",
    wants: "Que Maëlys signe, moralement. Qu'elle reconnaisse que la vente est légitime, que son frère n'est pas un monstre — et accessoirement qu'elle-même a bien fait. Elle est venue chercher une absolution qu'elle formule en attaque.",
  },
  lucas: {
    age: 33,
    role: 'le témoin qui pouvait empêcher',
    identity: "Chargé de mission en ressources humaines, spécialisé en médiation de conflit — l'ironie est totale : il est payé pour désamorcer des situations qu'il n'a jamais su nommer dans sa propre vie. Il connaît Noé depuis le lycée.",
    wound: "Il sait, depuis longtemps, qu'il a couvert. Pas activement : par temporisation, ce qu'il appelait de la patience. Il a une lucidité de premier rang et un courage de troisième.",
    wants: "Que la soirée n'explose pas. C'est tout, et c'est le problème : son objectif est un non-événement.",
    secret: "Un message vocal de Maëlys, quarante-huit secondes, laissé au printemps. Elle y dit une phrase qu'aucun des autres n'a entendue et qui, jouée après l'incident, change complètement l'interprétation du mobile. Il ne l'a jamais effacé.",
  },
  sarah: {
    age: 30,
    role: 'la vérité que personne ne croira',
    identity: "Libraire. Mémoire encyclopédique pour les textures, les odeurs, les phrases exactes des gens quand ils souffrent ; mémoire trouée pour la chronologie. Elle sort, depuis huit mois, d'un épisode dépressif sévère et suit un traitement.",
    wound: "La double dette. Maëlys l'a sauvée — concrètement, physiquement, pendant quatre mois. Et pendant ces quatre mois, Sarah écrivait la nuit à l'homme dont Maëlys découvrait les mensonges. Elle n'a rien fait de répréhensible, et elle sait qu'elle a trahi quand même.",
    wants: "Que Maëlys aille bien. Et, plus profondément, être pardonnée d'une chose qu'elle n'a jamais avouée.",
    secret: "Elle connaît une version antérieure du plan : fin septembre, Maëlys lui a dit, dans une voiture, quelque chose qui ressemblait à une menace, et qu'elle a choisi d'entendre comme une image.",
  },
  yanis: {
    age: 27,
    role: 'le perturbateur innocent',
    identity: "Chef de projet dans la boîte où travaille Noé, entré dans le groupe il y a dix-huit mois. Il fait des photos, il propose des jeux, il remplit les silences.",
    wound: "Il est arrivé dans un groupe qui possédait déjà sa langue. Dix-huit mois à faire semblant de comprendre des références et à sentir, sans pouvoir le nommer, qu'il y avait une pièce dans laquelle il n'entrerait jamais.",
    wants: "Sauver la soirée. Il croit sincèrement qu'un bon jeu et deux tournées règlent ce genre de choses — parce que dans sa vie, ça a toujours marché.",
  },
}

export interface ChronologyPhase {
  id: string
  period: string
  label: string
  text: string
}

export const CHRONOLOGY: ChronologyPhase[] = [
  {
    id: 'adhesion',
    period: 'A-7 à A-5',
    label: "L'adhésion",
    text: "Maëlys et Noé se rencontrent à la fin de leurs études. Lucas est déjà là, ami de Noé depuis le lycée. Sarah entre par Maëlys, sur un quai de gare. Inès gravite, plus jeune de six ans, avec une admiration qu'elle transformera plus tard en surveillance. Le groupe se dote très vite d'une mythologie : « on se dit tout, on ne se laisse pas tomber, on répare ensemble. »",
  },
  {
    id: 'investissement',
    period: 'A-5 à A-3',
    label: "L'investissement",
    text: "Achat de la maison, une ferme percheronne à deux heures de Paris. Sur le papier, Noé est seul emprunteur — Maëlys n'avait pas les revenus déclarés nécessaires à l'époque. C'est le péché originel juridique : elle a payé pendant cinq ans une maison qui ne portera jamais son nom. Elle a des preuves de ce qu'elle a payé. Elle n'a aucune preuve de ce qu'elle a construit.",
  },
  {
    id: 'mensonge_pratique',
    period: 'A-3 à A-2',
    label: 'Le mensonge pratique',
    text: "La société de Noé s'effondre lentement. Il ment d'abord par omission, puis par arrangement, puis par système. Lucas comprend en premier et choisit de ne rien dire à Maëlys. Inès découvre l'ampleur réelle en fouillant le téléphone de son frère, et décide de l'aider en silence — en tenant Maëlys à l'écart.",
  },
  {
    id: 'exclusion_douce',
    period: 'A-2, hiver',
    label: "L'exclusion douce",
    text: "Le glissement le plus grave, parce qu'il n'a pas de scène. Maëlys sent que les conversations changent de sujet quand elle entre. On l'appelle « fatiguée », puis « un peu à cran », puis, devant témoin : « trop dramatique ». C'est Inès qui le dit. Lucas ne la contredit pas. Noé sourit. Cette phrase est le vrai point d'origine du crime — pas les dettes : l'invalidation. Le même hiver, pendant que Maëlys tient Sarah à bout de bras jour après jour, Noé lui écrit la nuit.",
  },
  {
    id: 'effondrement',
    period: 'A-1, printemps',
    label: "L'effondrement",
    text: "Maëlys trouve, sur la tablette partagée, une capture d'écran d'une conversation entre Noé, Inès et un tiers, sur l'estimation du bien. Son nom n'apparaît nulle part. Le lendemain, elle trouve les messages de février. Noé ne se défend pas : il temporise, il part « quelques jours » qui deviennent la fin.",
  },
  {
    id: 'scenographie',
    period: 'A, septembre-octobre',
    label: 'La scénographie',
    text: "Yanis, entré dans le groupe dix-huit mois plus tôt, connaît une version édulcorée du passé — il croit qu'il y a eu « une rupture compliquée ». Fin septembre, Maëlys apprend que le bien va être mis en vente, et que le dossier est préparé dans l'étude où travaille Inès. Le 2 octobre, elle écrit six messages presque identiques, relus dix fois. Le 11 octobre, elle reçoit.",
  },
]

// 4.7 — Matrice relationnelle de départ (chapitre 4.7 de la bible).
// Échelle -100 (hostilité active) → +100 (loyauté inconditionnelle),
// lecture ligne → colonne ("ce que [ligne] ressent pour [colonne]").
// Jamais surfacée en jeu jusqu'ici — révélée en bloc à la toute fin,
// avec le reste des explications, plutôt qu'étalée pendant la partie :
// elle résume l'ensemble des rapports de force d'un coup d'œil, ce qui
// en ferait un résumé-spoiler trop efficace si elle apparaissait avant
// que le joueur ait vu la soirée par lui-même.
export interface RelationshipEntry {
  value: number
  note?: string
}

export const RELATIONSHIP_MATRIX: Record<CharacterId, Partial<Record<CharacterId, RelationshipEntry>>> = {
  maelys: {
    noe: { value: -85 },
    ines: { value: -70 },
    lucas: { value: -20 },
    sarah: { value: 45, note: 'instable' },
    yanis: { value: 10 },
  },
  noe: {
    maelys: { value: 30, note: 'honteux' },
    ines: { value: 55, note: 'dépendant' },
    lucas: { value: 65 },
    sarah: { value: 40, note: 'caché' },
    yanis: { value: 50 },
  },
  ines: {
    maelys: { value: -75 },
    noe: { value: 80, note: 'possessif' },
    lucas: { value: 15 },
    sarah: { value: -40, note: 'mépris' },
    yanis: { value: -10 },
  },
  lucas: {
    maelys: { value: 50 },
    noe: { value: 60 },
    ines: { value: 20 },
    sarah: { value: 55 },
    yanis: { value: 35 },
  },
  sarah: {
    maelys: { value: 90, note: 'dette' },
    noe: { value: 25, note: 'coupable' },
    ines: { value: -25 },
    lucas: { value: 60 },
    yanis: { value: 45 },
  },
  yanis: {
    maelys: { value: 40 },
    noe: { value: 70 },
    ines: { value: 30 },
    lucas: { value: 45 },
    sarah: { value: 60 },
  },
}

const ALL_CHARACTERS: CharacterId[] = ['maelys', 'noe', 'ines', 'lucas', 'sarah', 'yanis']

/**
 * Regard mutuel du groupe sur un personnage : moyenne de ce qu'il ressent
 * pour chacun des cinq autres ET de ce que chacun des cinq autres ressent
 * pour lui ("le regard qu'on a sur les autres et vice versa"). Sert à
 * pondérer, dans endingCalculator.ts, si une accusation ou une interruption
 * de ce personnage est prise au sérieux par le reste du groupe — un
 * personnage envers qui le groupe est en confiance réciproque est écouté ;
 * un personnage isolé ou méfié est balayé, même s'il a raison.
 * Renvoie une valeur -100..+100 (même échelle que RELATIONSHIP_MATRIX).
 */
export function mutualTrustScore(character: CharacterId): number {
  const others = ALL_CHARACTERS.filter((c) => c !== character)
  let total = 0
  for (const other of others) {
    total += RELATIONSHIP_MATRIX[character]?.[other]?.value ?? 0
    total += RELATIONSHIP_MATRIX[other]?.[character]?.value ?? 0
  }
  return total / (others.length * 2)
}

/** Version normalisée 0..1 de mutualTrustScore, pour se combiner avec un ratio comme clueScoreRatio. */
export function mutualTrustRatio(character: CharacterId): number {
  return Math.max(0, Math.min(1, (mutualTrustScore(character) + 100) / 200))
}

/** Étiquette qualitative pour une valeur de la matrice, -100 à +100 */
export function relationshipLabel(value: number): string {
  if (value >= 70) return 'loyauté inconditionnelle'
  if (value >= 40) return 'loyauté forte'
  if (value >= 10) return 'confiance'
  if (value >= -9) return 'neutre'
  if (value >= -39) return 'méfiance'
  if (value >= -69) return 'hostilité'
  return 'hostilité active'
}
