// Résumés détaillés des 9 fins — bible narrative étendue (2026-08-01),
// sections 2 (explication finale unifiée), 4 (architecture des fins) et 5
// (scènes finales proposées). `short` sert de sous-titre ; `detail` est le
// grand texte affiché à la révélation ; `lastLine` clôt l'écran, dans le
// même esprit que la ligne finale du chapitre 14 de la bible d'origine.
import type { EndingId } from '@/lib/types/endings'

export interface EndingSummary {
  title: string
  short: string
  detail: string
  lastLine: string
}

export const ENDING_SUMMARIES: Record<EndingId, EndingSummary> = {
  F0: {
    title: 'Noé à l’hôpital',
    short: 'La fin canonique : Noé survit, et sa survie ouvre une vérité plus sale que sa mort n’en aurait ouvert.',
    detail: "Maëlys n'a jamais voulu tuer. Elle a voulu rendre Noé très malade — assez pour le contraindre à une vérité publique, assez pour lui faire perdre sa superbe, assez pour reprendre un ascendant moral après cinq ans d'une maison qui ne porte jamais son nom, après les dettes tues, après l'abandon d'un hiver où il écrivait la nuit à quelqu'un d'autre. Elle a sous-estimé trois choses : les déplacements de table, la logistique du service, et l'épaisseur réelle du passif émotionnel du groupe. Noé mange l'assiette qui lui était destinée. La détresse est sévère, rapide, terrifiante à regarder. Il part en ambulance. Il survit — grâce à une prise en charge rapide, pas grâce à la chance de personne dans cette maison. Sa survie n'éteint rien : elle ouvre une vérité plus sale que sa mort n'en aurait ouvert. Ce n'est plus « qui a empoisonné ? » qui compte désormais, mais qui a laissé la mécanique aller jusqu'au bout — et la faute, cette nuit-là, se distribue à peu près également.",
    lastLine: "Sarah Kessler avait raison sur tout, sauf sur l'ordre.",
  },
  F1: {
    title: 'Sarah touchée, récit faux dominant',
    short: 'La mauvaise personne a reçu l’assiette. La bonne version est sortie quand même.',
    detail: "L'assiette prévue pour Noé n'arrive jamais jusqu'à lui. Un déplacement de dernière minute — Inès et Sarah échangent leurs places pendant le service — et c'est Sarah qui reçoit la charge. Le vertige, la pâleur, l'effondrement : tout va très vite, et tout le monde préfère la version la plus commode. Noé, soulagé sans se l'avouer, construit un récit autour de la fragilité de Sarah — son traitement, sa mémoire trouée, sa nuit compliquée. Personne ne le contredit vraiment. Lucas a vu quelque chose, il a le vocal dans sa poche, et il ne dit rien d'assez fort pour que ça compte. Le groupe repart avec l'histoire la plus triste et la plus facile à croire : celle où la victime porte, en plus du mal qu'on lui a fait, la responsabilité de l'avoir provoqué.",
    lastLine: "Sarah Kessler avait raison sur tout, sauf sur l'ordre.",
  },
  F2: {
    title: 'Inès touchée à la place de Noé',
    short: 'Vous avez compris qui voulait punir. Pas qui, finalement, a payé.',
    detail: "Aucun déplacement de dernière minute cette fois : le service suit son ordre initial, et c'est Inès — à la place que le hasard, et non Maëlys, lui a donnée ce soir-là — qui reçoit ce qui était pensé pour son frère. L'ironie est cruelle : c'est elle qui a le plus protégé Noé pendant des années, elle qui a tenu Maëlys à l'écart pour lui épargner une vérité qu'elle jugeait trop lourde. Elle s'en sort, mais mal. Noé, lui, reste intact — physiquement. Il découvre, impuissant, que sa sœur a payé un prix qui lui était destiné, et qu'il n'a jamais eu le courage d'éviter par lui-même. Ce n'est la fin de personne : c'est le début d'une dette que personne ne pourra jamais vraiment rembourser.",
    lastLine: "Personne n'a jamais demandé à Inès ce qu'elle, elle, aurait dit.",
  },
  F3: {
    title: 'Double contamination — Sarah et Inès',
    short: 'Un message précis, adressé à un seul homme, devenu un désastre collectif.',
    detail: "Rien ne se passe comme prévu. Un changement de places, une hésitation dans le service, un geste de trop — la soirée bascule en catastrophe collective plutôt qu'en incident ciblé. Sarah et Inès sont toutes les deux atteintes, à des degrés différents, par une mécanique qui n'était plus sous le contrôle de personne, pas même de Maëlys. Ce qui devait être un message précis, adressé à un seul homme, devient un désastre qui n'épargne ni la victime canonique du récit ni celle qui pensait n'avoir rien à y voir. Noé regarde, intact, ce que son silence de plusieurs années a fini par produire à sa place — sur deux personnes, pas une.",
    lastLine: 'Deux ambulances sont reparties cette nuit-là, et une seule version est restée.',
  },
  F4: {
    title: 'Maëlys auto-contaminée',
    short: 'La seule fin où elle est physiquement punie. Ce n’est pas une rédemption.',
    detail: "Le service, si minutieusement préparé, se retourne contre elle. Une chaîne de replacements que même Maëlys n'a pas vue venir, et c'est l'assiette qu'elle a elle-même dosée qui finit par revenir jusqu'à sa propre place. Elle la mange — pour ne pas éveiller les soupçons, parce qu'un refus aurait été un aveu, parce que la scénographie qu'elle a bâtie toute la soirée exige qu'elle en fasse partie jusqu'au bout. C'est la seule fin où elle est physiquement punie, et ce n'est pas une rédemption : c'est la preuve qu'elle a tout contrôlé, sauf le fait qu'elle était, elle aussi, dans la pièce.",
    lastLine: "Elle a tout contrôlé, sauf le fait qu'elle était aussi dans la pièce.",
  },
  F5: {
    title: 'Lucas interrompt, accuse trop tôt',
    short: 'Personne ne meurt. Et c’est presque pire : plus personne ne saura jamais avec certitude.',
    detail: "Personne ne meurt cette nuit-là — et c'est presque pire. Lucas, qui a vu le reflet, qui a le vocal, qui a additionné plus de choses que quiconque, choisit de parler avant que la mécanique n'aille au bout. Il interrompt le service, ou le morpion, ou confronte Maëlys directement, sans avoir réuni assez de preuves pour que l'accusation tienne. Le groupe se fracture sur place. Maëlys nie, calmement, avec cette politesse qui coupe plus qu'un cri. Personne ne saura jamais avec certitude si Lucas avait raison — pas même lui. La soirée s'arrête net, sans version officielle, sans clôture : juste un groupe qui ne se reparlera plus jamais tout à fait de la même façon.",
    lastLine: "Elle n'a rien dit. On ne lui a rien demandé.",
  },
  F6: {
    title: 'Noé comprend trop tard, force Sarah à se taire',
    short: 'Survie physique, destruction morale maximale.',
    detail: "Noé survit à l'hôpital — la mécanique est allée jusqu'au bout, cette fois. Mais dans les jours qui suivent, il comprend. Pas par empathie : parce qu'il connaît Maëlys, parce qu'il sait reconnaître sa propre écriture dans le désastre. Il choisit le silence, et il a un levier pour l'imposer : la relation cachée avec Sarah, les messages supprimés la veille au soir, tout ce qu'elle ne dira jamais parce qu'elle porte déjà sa propre dette envers Maëlys. Le récit qui sort de la maison est net, propre, faux. Sarah, qui n'a jamais menti à personne ce soir-là, en ressort niée. Noé a survécu physiquement. Moralement, c'est elle qui est détruite.",
    lastLine: 'Noé a survécu. Sarah a été condamnée par son existence même dans la soirée.',
  },
  F7: {
    title: 'Vérité complète, post-hôpital',
    short: 'La vérité n’est pas sortie du dîner. Elle est sortie de l’hôpital.',
    detail: "Noé survit, mais cette fois la vérité ne s'arrête pas à la porte de la maison. Une photo prise à 21h47, un vocal jamais effacé, une page de carnet — les preuves matérielles s'assemblent, une par une, pendant que quelqu'un accepte enfin de parler. Ce n'est pas la table qui a produit la vérité : c'est l'hôpital, l'examen, l'enquête qui commence dans les jours qui suivent. Maëlys ne peut plus tenir la version qu'elle avait préparée. Ce n'est pas une fin de justice nette — le prix social a déjà été payé par tout le monde avant que le dossier existe — mais c'est la seule fin où la vérité sort réellement de la maison, même en retard.",
    lastLine: "La vérité n'est pas sortie du dîner. Elle est sortie de l'hôpital.",
  },
  F8: {
    title: 'Fin noire — Noé détruit Sarah publiquement',
    short: 'Deux survivants avaient tous les deux quelque chose à cacher. Un seul avait le pouvoir de choisir lequel comptait.',
    detail: "Noé survit, intact, et c'est là que tout empire. Il n'est pas touché par le doute : il comprend vite, et il choisit d'imposer une version publique où Sarah passe pour instable — sa dépression, son traitement, ses médicaments mal pris — plutôt que d'affronter ce que sa propre survie révèle. Dans une tension déjà montée trop haut, personne n'a plus la force de la défendre. La soirée produit deux survivants qui avaient tous les deux quelque chose à cacher, et un seul d'entre eux avait le pouvoir social de choisir lequel des deux secrets allait compter.",
    lastLine: 'La soirée a produit deux survivants qui avaient tous les deux quelque chose à cacher.',
  },
}
