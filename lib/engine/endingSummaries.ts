// Résumés détaillés des 9 fins — bible narrative étendue (2026-08-01),
// enrichis avec le déroulé précis fourni par l'utilisateur ("Sous la nappe
// — L'histoire en clair") : horaires exacts (21h34 le reflet, 22h01 la
// chute de Sarah, 21h47 la photo de Yanis), gestes précis (le verre plein
// de Maëlys, le regard de Noé avant de parler, la remarque d'Inès qui
// dégénère). `short` sert de sous-titre ; `detail` est le grand texte
// affiché à la révélation ; `lastLine` clôt l'écran, dans le même esprit
// que la ligne finale du chapitre 14 de la bible d'origine.
//
// Note de cohérence : le texte source situe la place réservée à Noé en
// "position 2" du passe, mais la position 2 (BASE_SEATING/SWAP_B_SEATING)
// ne varie jamais entre les deux variantes de placement — seules les
// places 3/4 (Inès/Sarah) s'échangent. Comme c'est justement cet échange
// qui doit pouvoir dévier l'assiette vers Sarah, ces résumés utilisent la
// position 4 (cohérent avec le moteur de déviation, lib/engine/deviation.ts).
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
    detail: "Maëlys n'a jamais voulu tuer. Elle a voulu rendre Noé très malade — assez pour le contraindre à une vérité publique, assez pour lui faire perdre sa superbe, assez pour reprendre un ascendant moral après cinq ans d'une maison qui ne porte jamais son nom, après les dettes tues, après l'abandon d'un hiver où il écrivait la nuit à quelqu'un d'autre. Elle a préparé sa sauce dosée l'après-midi même, caché le récipient en grès derrière la boîte à sel, et réservé l'assiette à la position 4 du passe — sa place à lui. Son verre est resté plein toute la soirée : elle n'a pas bu une gorgée, elle attendait. Noé arrive en retard, s'assoit à la mauvaise place ; elle l'y ramène sans hausser le ton. Malgré les déplacements de la soirée — malgré Inès et Sarah qui échangent leurs sièges, malgré Sarah qui perd le morpion et se retrouve à servir — l'assiette finit quand même par atteindre sa cible. Noé mange. La détresse est sévère, rapide, terrifiante à regarder. Il part en ambulance. Il survit — grâce à une prise en charge rapide, pas grâce à la chance de personne dans cette maison. Sa survie n'éteint rien : elle ouvre une vérité plus sale que sa mort n'en aurait ouvert. Ce n'est plus « qui a empoisonné ? » qui compte désormais, mais qui a laissé la mécanique aller jusqu'au bout — et la faute, cette nuit-là, se distribue à peu près également.",
    lastLine: "Sarah Kessler avait raison sur tout, sauf sur l'ordre.",
  },
  F1: {
    title: 'Sarah touchée, récit faux dominant',
    short: 'La mauvaise personne a reçu l’assiette. La bonne version est sortie quand même.',
    detail: "L'assiette réservée à la position 4 — la place de Noé — n'arrive jamais jusqu'à lui. Une remarque d'Inès dégénère en plein service ; par réflexe d'apaisement, Inès et Sarah échangent leurs sièges. Plus tôt dans la soirée, Sarah a perdu le morpion organisé par Yanis : c'est donc elle qui porte les assiettes dans l'ordre du passe, et c'est elle, sans le savoir, qui récupère celle qui était chargée. À 21h34, Lucas voit le geste de Maëlys dans le reflet de la vitre du cellier. Il ne dit rien — ni sur le moment, ni dans l'heure qui suit. Sarah s'effondre à 22h01. Noé, avant de parler, regarde Maëlys une fraction de seconde — une négociation silencieuse que personne d'autre ne remarque — puis construit à voix haute un récit autour de la fragilité de Sarah : médicaments oubliés, stress, une phrase de trop. Personne ne le contredit vraiment. Le groupe repart avec l'histoire la plus triste et la plus facile à croire : celle où la victime porte, en plus du mal qu'on lui a fait, la responsabilité de l'avoir provoqué.",
    lastLine: "Sarah Kessler avait raison sur tout, sauf sur l'ordre.",
  },
  F2: {
    title: 'Inès touchée à la place de Noé',
    short: 'Vous avez compris qui voulait punir. Pas qui, finalement, a payé.',
    detail: "Cette fois, aucun échange de sièges ne vient perturber le service : Inès reste à la place que le hasard, et non Maëlys, lui a donnée ce soir-là — une place qui se trouve être, sans qu'elle le sache, dans la trajectoire de l'assiette réservée à la position 4. L'ironie est cruelle : c'est elle qui a le plus protégé Noé pendant des années, elle qui a tenu Maëlys à l'écart pour lui épargner une vérité qu'elle jugeait trop lourde à porter. Elle s'en sort, mais mal. Noé, lui, reste intact — physiquement. Il découvre, impuissant, que sa sœur a payé un prix qui lui était destiné, et qu'il n'a jamais eu le courage d'éviter par lui-même. Ce n'est la fin de personne : c'est le début d'une dette que personne ne pourra jamais vraiment rembourser.",
    lastLine: "Personne n'a jamais demandé à Inès ce qu'elle, elle, aurait dit.",
  },
  F3: {
    title: 'Double contamination — Sarah et Inès',
    short: 'Un message précis, adressé à un seul homme, devenu un désastre collectif.',
    detail: "Rien ne se passe comme prévu. Yanis, pour « relancer l'ambiance », propose à tout le monde de changer de place — un geste généreux, pensé pour détendre, qui brouille en réalité toute la logique du service. Dans ce désordre, la position 4 devient impossible à tracer avec certitude. Sarah et Inès sont toutes les deux atteintes, à des degrés différents, par une mécanique qui n'était plus sous le contrôle de personne, pas même de Maëlys. Ce qui devait être un message précis, adressé à un seul homme, devient un désastre qui n'épargne ni la victime canonique du récit ni celle qui pensait n'avoir rien à y voir. Noé regarde, intact, ce que son silence de plusieurs années a fini par produire à sa place — sur deux personnes, pas une.",
    lastLine: 'Deux ambulances sont reparties cette nuit-là, et une seule version est restée.',
  },
  F4: {
    title: 'Maëlys auto-contaminée',
    short: 'La seule fin où elle est physiquement punie. Ce n’est pas une rédemption.',
    detail: "Le service, si minutieusement préparé, se retourne contre elle. Une chaîne de replacements que même Maëlys — qui n'a pourtant pas quitté sa mise en scène des yeux de toute la soirée, verre plein, en alerte — n'a pas vue venir : c'est l'assiette qu'elle a elle-même dosée qui finit par revenir jusqu'à sa propre place. Elle la mange — pour ne pas éveiller les soupçons, parce qu'un refus aurait été un aveu, parce que la scénographie qu'elle a bâtie toute la soirée exige qu'elle en fasse partie jusqu'au bout. C'est la seule fin où elle est physiquement punie, et ce n'est pas une rédemption : c'est la preuve qu'elle a tout contrôlé, sauf le fait qu'elle était, elle aussi, dans la pièce.",
    lastLine: "Elle a tout contrôlé, sauf le fait qu'elle était aussi dans la pièce.",
  },
  F5: {
    title: 'Lucas interrompt, accuse trop tôt',
    short: 'Personne ne meurt. Et c’est presque pire : plus personne ne saura jamais avec certitude.',
    detail: "Personne ne meurt cette nuit-là — et c'est presque pire. Lucas a vu ce qu'il fallait voir : le reflet à 21h34, le geste que Maëlys croyait invisible. Mais il agit avant d'avoir vraiment de quoi le prouver. Parfois c'est un geste concret et prématuré — il s'interpose dans le service, ou interrompt le morpion à 21h26 pour empêcher que Sarah ne soit désignée. Parfois c'est une parole : il confronte Maëlys directement, sans avoir réuni assez d'éléments pour que l'accusation tienne. Dans les deux cas, la mécanique s'arrête avant d'aller au bout, et le groupe se fracture sur place. Maëlys nie, calmement, avec cette politesse qui coupe plus qu'un cri. Personne ne saura jamais avec certitude si Lucas avait raison — pas même lui. La soirée s'arrête net, sans version officielle, sans clôture : juste un groupe qui ne se reparlera plus jamais tout à fait de la même façon.",
    lastLine: "Elle n'a rien dit. On ne lui a rien demandé.",
  },
  F6: {
    title: 'Noé comprend trop tard, force Sarah à se taire',
    short: 'Survie physique, destruction morale maximale.',
    detail: "Noé survit à l'hôpital — la mécanique est allée jusqu'au bout, cette fois. Mais dans les jours qui suivent, il comprend. Pas par empathie : parce qu'il connaît Maëlys, parce qu'il sait reconnaître sa propre écriture dans le désastre. Il choisit le silence, et il a un levier pour l'imposer : la relation cachée avec Sarah, ces mois où ils s'écrivaient la nuit sans que personne ne le sache, les messages supprimés la veille au soir « par respect pour tout le monde ». Sans jamais se le dire ouvertement, Noé et Maëlys laissent s'installer un récit où Sarah devient instable, responsable, fragile depuis toujours. Lucas ne parle pas. Le récit qui sort de la maison est net, propre, faux. Sarah, qui n'a jamais menti à personne ce soir-là, en ressort niée. Noé a survécu physiquement. Moralement, c'est elle qui est détruite.",
    lastLine: 'Noé a survécu. Sarah a été condamnée par son existence même dans la soirée.',
  },
  F7: {
    title: 'Vérité complète, post-hôpital',
    short: 'La vérité n’est pas sortie du dîner. Elle est sortie de l’hôpital.',
    detail: "Noé survit, mais cette fois la vérité ne s'arrête pas à la porte de la maison. Un examen toxicologique, à l'hôpital, ouvre une enquête que personne n'avait anticipée. Puis les preuves matérielles s'assemblent, une par une : la photo que Yanis a prise à 21h47 sans comprendre ce qu'elle montrait vraiment, le vocal que Lucas n'a jamais effacé, la page arrachée d'un carnet que Maëlys croyait avoir brûlée avec le reste. Il suffit que quelqu'un accepte enfin de parler pour que ces trois fragments, pris ensemble, ne laissent plus de place au doute. Maëlys ne peut plus tenir la version qu'elle avait préparée. Sarah, jamais crue sur le moment, est réhabilitée — trop tard pour effacer la nuit, mais pas trop tard pour que ça compte. Ce n'est pas une fin de justice nette — le prix social a déjà été payé par tout le monde avant que le dossier existe — mais c'est la seule fin où la vérité sort réellement de la maison, même en retard.",
    lastLine: "La vérité n'est pas sortie du dîner. Elle est sortie de l'hôpital.",
  },
  F8: {
    title: 'Fin noire — Noé détruit Sarah publiquement',
    short: 'Deux survivants avaient tous les deux quelque chose à cacher. Un seul avait le pouvoir de choisir lequel comptait.',
    detail: "Noé survit, intact, et c'est là que tout empire. Il n'est pas touché par le doute : il comprend vite, et il choisit d'imposer une version publique où Sarah passe pour instable — sa dépression, son traitement, ses médicaments mal pris — plutôt que d'affronter ce que sa propre survie révèle. Dans une tension déjà montée trop haut, personne n'a plus la force de la défendre. La soirée produit deux survivants qui avaient tous les deux quelque chose à cacher, et un seul d'entre eux avait le pouvoir social de choisir lequel des deux secrets allait compter.",
    lastLine: 'La soirée a produit deux survivants qui avaient tous les deux quelque chose à cacher.',
  },
  E1: {
    title: 'Inès co-coupable',
    short: 'Noé survit. Le mobile financier sort au jour. Inès savait, et s’est tue.',
    detail: "Noé survit à l'hôpital, comme dans la version la plus canonique de cette nuit-là. Mais ce qui remonte ensuite ne concerne pas seulement Maëlys : un virement resté dans un tiroir, un vocal qu'il n'aurait jamais dû laisser traîner, une colonne de chiffres dans un carnet — la dette que Noé traînait envers Maëlys depuis des années finit par sortir, elle aussi. Et Inès, qui a toujours été celle qui répare, qui couvre, qui range avant que ça ne se voie, avait vu quelque chose dans cette cuisine bien avant l'incident — des boîtes qu'elle a rangées mentalement sans y penser vraiment, ou un silence qu'elle a laissé s'installer une fois de trop pendant l'aftermath, quand poser la question qui dérange aurait tout changé. Elle n'a rien préparé, rien versé dans une assiette. Mais elle savait, et elle n'a rien dit — pas par malveillance, par habitude d'être celle qui protège son frère de tout, y compris de la vérité. Ce n'est pas elle qui a empoisonné personne. C'est elle qui a laissé le silence faire le reste.",
    lastLine: "Elle a toujours été celle qui répare. Cette fois, il n'y avait rien à réparer — juste à se taire.",
  },
  E2: {
    title: 'Solidarité toxique',
    short: 'Noé survit. Sarah savait pour Maëlys. Elle a choisi de couvrir, quand même.',
    detail: "Noé survit à l'hôpital. Mais Sarah, dans cette version de la nuit, n'est pas seulement une victime collatérale de la mécanique de Maëlys — elle porte, depuis des années, un lien avec elle que personne d'autre à cette table n'a jamais soupçonné. Une photo de vacances laissée bien en évidence dans le couloir, un SMS jamais envoyé resté en brouillon, un regard que Maëlys a fini par lui accorder une seule fois dans toute la soirée, contre son habitude de ne jamais la regarder en face : les traces d'une proximité ancienne, coupée sans explication, que Sarah n'a jamais vraiment comprise. Alors, à la fin, quand tout le monde attend qu'elle parle — elle qui a le plus de raisons de le faire — Sarah se lève et part sans qu'on le lui ait demandé. Pas parce qu'elle ne sait pas. Parce qu'elle sait, précisément, et que ce qu'elle protège encore, malgré tout ce qui vient de se passer, c'est Maëlys. Ce n'est pas de la lâcheté au sens simple du mot. C'est une loyauté plus vieille que la soirée, et plus abîmée qu'elle n'y paraît.",
    lastLine: "Ce n'est pas qu'elle ne savait pas. C'est qu'elle a choisi, encore une fois, de protéger la mauvaise personne.",
  },
  E3: {
    title: 'Preuve effacée',
    short: 'Noé survit. La photo qui aurait pu tout prouver existait. Elle a disparu avant de compter.',
    detail: "Noé survit à l'hôpital. Quelque part dans la soirée, à 21h47, Yanis a pris une photo sans savoir ce qu'il capturait vraiment : le passe, les assiettes en ligne, et dans le reflet de la vitre du cellier, un geste que personne n'était censé voir. Cette photo existe. Elle est sur son téléphone, mêlée à des dizaines d'autres clichés de soirée sans importance. Mais avant que quiconque d'autre ne pense à la regarder vraiment, Maëlys — qui gère déjà tout, qui range, qui construit le récit phrase après phrase — demande à voir le téléphone de Yanis, discrètement, sous un prétexte anodin. Elle trouve ce qu'elle cherchait. Ce qui aurait pu être la preuve irréfutable, celle qui aurait changé toute l'issue de cette nuit, disparaît avant que sa valeur n'ait été comprise par personne d'autre qu'elle. Yanis ne se rend compte de rien. Il a juste, sans le vouloir, été le complice involontaire d'une preuve qu'il ne savait même pas avoir prise.",
    lastLine: "La preuve a existé. Le temps qu'on comprenne ce qu'elle montrait, elle n'existait déjà plus.",
  },
}
