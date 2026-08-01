// Résumés détaillés des fins — bible narrative étendue (2026-08-01),
// enrichis avec le déroulé précis fourni par l'utilisateur ("Sous la nappe
// — L'histoire en clair") : horaires exacts (21h34 le reflet, 22h01 la
// chute de Sarah, 21h47 la photo de Yanis), gestes précis (le verre plein
// de Maëlys, le regard de Noé avant de parler, la remarque d'Inès qui
// dégénère). `short` sert de sous-titre ; `detail` est le grand texte
// affiché à la révélation ; `lastLine` clôt l'écran, dans le même esprit
// que la ligne finale du chapitre 14 de la bible d'origine.
//
// Note de style (2026-08-01) : plus de tirets cadratins dans le texte
// joueur, des phrases simples plutôt que des incises. Chaque fin porte un
// vrai coût dramatique — mort, blessure, mais aussi trahison, injustice,
// silence qui abîme une relation — aucune ne se referme sur un pur
// soulagement.
//
// Note de cohérence : le texte source situe la place réservée à Noé en
// "position 2" du passe, mais la position 2 (BASE_SEATING/SWAP_B_SEATING)
// ne varie jamais entre les deux variantes de placement, seules les
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
    detail: "Maëlys n'a jamais voulu tuer. Elle a voulu rendre Noé très malade, assez pour le contraindre à une vérité publique, assez pour lui faire perdre sa superbe, assez pour reprendre un ascendant moral après cinq ans d'une maison qui ne porte jamais son nom, après les dettes tues, après l'abandon d'un hiver où il écrivait la nuit à quelqu'un d'autre. Elle a préparé sa sauce dosée l'après-midi même, caché le récipient en grès derrière la boîte à sel, et réservé l'assiette à la position 4 du passe, sa place à lui. Son verre est resté plein toute la soirée : elle n'a pas bu une gorgée, elle attendait. Noé arrive en retard, s'assoit à la mauvaise place ; elle l'y ramène sans hausser le ton. Malgré les déplacements de la soirée (Inès et Sarah qui échangent leurs sièges, Sarah qui perd le morpion et se retrouve à servir), l'assiette finit quand même par atteindre sa cible. Noé mange. La détresse est sévère, rapide, terrifiante à regarder. Il part en ambulance. Il survit, grâce à une prise en charge rapide, pas grâce à la chance de personne dans cette maison. Sa survie n'éteint rien : elle ouvre une vérité plus sale que sa mort n'en aurait ouvert. Ce n'est plus « qui a empoisonné ? » qui compte désormais, mais qui a laissé la mécanique aller jusqu'au bout. Et la faute, cette nuit-là, se distribue à peu près également.",
    lastLine: "Sarah Kessler avait raison sur tout, sauf sur l'ordre.",
  },
  F1: {
    title: 'Sarah touchée, récit faux dominant',
    short: 'La mauvaise personne a reçu l’assiette. La bonne version est sortie quand même.',
    detail: "L'assiette réservée à la position 4, la place de Noé, n'arrive jamais jusqu'à lui. Une remarque d'Inès dégénère en plein service ; par réflexe d'apaisement, Inès et Sarah échangent leurs sièges. Plus tôt dans la soirée, Sarah a perdu le morpion organisé par Yanis : c'est donc elle qui porte les assiettes dans l'ordre du passe, et c'est elle, sans le savoir, qui récupère celle qui était chargée. À 21h34, Lucas voit le geste de Maëlys dans le reflet de la vitre du cellier. Il ne dit rien, ni sur le moment, ni dans l'heure qui suit. Sarah s'effondre à 22h01. Noé, avant de parler, regarde Maëlys une fraction de seconde. Une négociation silencieuse que personne d'autre ne remarque. Puis il construit à voix haute un récit autour de la fragilité de Sarah : médicaments oubliés, stress, une phrase de trop. Personne ne le contredit vraiment. Le groupe repart avec l'histoire la plus triste et la plus facile à croire : celle où la victime porte, en plus du mal qu'on lui a fait, la responsabilité de l'avoir provoqué.",
    lastLine: "Sarah Kessler avait raison sur tout, sauf sur l'ordre.",
  },
  F2: {
    title: 'Inès touchée à la place de Noé',
    short: 'Vous avez compris qui voulait punir. Pas qui, finalement, a payé.',
    detail: "Cette fois, aucun échange de sièges ne vient perturber le service : Inès reste à la place que le hasard, et non Maëlys, lui a donnée ce soir-là, une place qui se trouve être, sans qu'elle le sache, dans la trajectoire de l'assiette réservée à la position 4. L'ironie est cruelle : c'est elle qui a le plus protégé Noé pendant des années, elle qui a tenu Maëlys à l'écart pour lui épargner une vérité qu'elle jugeait trop lourde à porter. Elle s'en sort, mais mal. Noé, lui, reste intact physiquement. Il découvre, impuissant, que sa sœur a payé un prix qui lui était destiné, et qu'il n'a jamais eu le courage d'éviter par lui-même. Ce n'est la fin de personne : c'est le début d'une dette que personne ne pourra jamais vraiment rembourser.",
    lastLine: "Personne n'a jamais demandé à Inès ce qu'elle, elle, aurait dit.",
  },
  F3: {
    title: 'Double contamination : Sarah et Inès',
    short: 'Un message précis, adressé à un seul homme, devenu un désastre collectif.',
    detail: "Rien ne se passe comme prévu. Yanis, pour « relancer l'ambiance », propose à tout le monde de changer de place, un geste généreux, pensé pour détendre, qui brouille en réalité toute la logique du service. Dans ce désordre, la position 4 devient impossible à tracer avec certitude. Sarah et Inès sont toutes les deux atteintes, à des degrés différents, par une mécanique qui n'était plus sous le contrôle de personne, pas même de Maëlys. Ce qui devait être un message précis, adressé à un seul homme, devient un désastre qui n'épargne ni la victime canonique du récit ni celle qui pensait n'avoir rien à y voir. Noé regarde, intact, ce que son silence de plusieurs années a fini par produire à sa place, sur deux personnes, pas une.",
    lastLine: 'Deux ambulances sont reparties cette nuit-là, et une seule version est restée.',
  },
  F4: {
    title: 'Maëlys auto-contaminée',
    short: 'La seule fin où elle est physiquement punie. Ce n’est pas une rédemption.',
    detail: "Le service, si minutieusement préparé, se retourne contre elle. Une chaîne de replacements que même Maëlys (qui n'a pourtant pas quitté sa mise en scène des yeux de toute la soirée, verre plein, en alerte) n'a pas vue venir : c'est l'assiette qu'elle a elle-même dosée qui finit par revenir jusqu'à sa propre place. Elle la mange, pour ne pas éveiller les soupçons, parce qu'un refus aurait été un aveu, parce que la scénographie qu'elle a bâtie toute la soirée exige qu'elle en fasse partie jusqu'au bout. C'est la seule fin où elle est physiquement punie, et ce n'est pas une rédemption : c'est la preuve qu'elle a tout contrôlé, sauf le fait qu'elle était, elle aussi, dans la pièce.",
    lastLine: "Elle a tout contrôlé, sauf le fait qu'elle était aussi dans la pièce.",
  },
  F5: {
    title: 'Lucas interrompt, accuse trop tôt',
    short: 'Personne ne meurt. Et c’est presque pire : plus personne ne saura jamais avec certitude.',
    detail: "Personne ne meurt cette nuit-là. Et c'est presque pire. Lucas a vu ce qu'il fallait voir : le reflet à 21h34, le geste que Maëlys croyait invisible. Mais il agit avant d'avoir vraiment de quoi le prouver. Parfois c'est un geste concret et prématuré, il s'interpose dans le service, ou interrompt le morpion à 21h26 pour empêcher que Sarah ne soit désignée. Parfois c'est une parole : il confronte Maëlys directement, sans avoir réuni assez d'éléments pour que l'accusation tienne. Dans les deux cas, la mécanique s'arrête avant d'aller au bout, et le groupe se fracture sur place. Maëlys nie, calmement, avec cette politesse qui coupe plus qu'un cri. Personne ne saura jamais avec certitude si Lucas avait raison, pas même lui. La soirée s'arrête net, sans version officielle, sans clôture : juste un groupe qui ne se reparlera plus jamais tout à fait de la même façon.",
    lastLine: "Elle n'a rien dit. On ne lui a rien demandé.",
  },
  F6: {
    title: 'Noé comprend trop tard, force Sarah à se taire',
    short: 'Survie physique, destruction morale maximale.',
    detail: "Noé survit à l'hôpital. La mécanique est allée jusqu'au bout, cette fois. Mais dans les jours qui suivent, il comprend. Pas par empathie : parce qu'il connaît Maëlys, parce qu'il sait reconnaître sa propre écriture dans le désastre. Il choisit le silence, et il a un levier pour l'imposer : la relation cachée avec Sarah, ces mois où ils s'écrivaient la nuit sans que personne ne le sache, les messages supprimés la veille au soir « par respect pour tout le monde ». Sans jamais se le dire ouvertement, Noé et Maëlys laissent s'installer un récit où Sarah devient instable, responsable, fragile depuis toujours. Lucas ne parle pas. Le récit qui sort de la maison est net, propre, faux. Sarah, qui n'a jamais menti à personne ce soir-là, en ressort niée. Noé a survécu physiquement. Moralement, c'est elle qui est détruite.",
    lastLine: 'Noé a survécu. Sarah a été condamnée par son existence même dans la soirée.',
  },
  F7: {
    title: 'Vérité complète, post-hôpital',
    short: 'La vérité n’est pas sortie du dîner. Elle est sortie de l’hôpital.',
    detail: "Noé survit, mais cette fois la vérité ne s'arrête pas à la porte de la maison. Un examen toxicologique, à l'hôpital, ouvre une enquête que personne n'avait anticipée. Puis les preuves matérielles s'assemblent, une par une : la photo que Yanis a prise à 21h47 sans comprendre ce qu'elle montrait vraiment, le vocal que Lucas n'a jamais effacé, la page arrachée d'un carnet que Maëlys croyait avoir brûlée avec le reste. Il suffit que quelqu'un accepte enfin de parler pour que ces trois fragments, pris ensemble, ne laissent plus de place au doute. Maëlys ne peut plus tenir la version qu'elle avait préparée. Sarah, jamais crue sur le moment, est réhabilitée, trop tard pour effacer la nuit, mais pas trop tard pour que ça compte. Ce n'est pas une fin de justice nette. Le prix social a déjà été payé par tout le monde avant même que le dossier existe. Mais c'est la seule fin où la vérité sort réellement de la maison, même en retard.",
    lastLine: "La vérité n'est pas sortie du dîner. Elle est sortie de l'hôpital.",
  },
  F8: {
    title: 'Fin noire : Noé détruit Sarah publiquement',
    short: 'Deux survivants avaient tous les deux quelque chose à cacher. Un seul avait le pouvoir de choisir lequel comptait.',
    detail: "Noé survit, intact, et c'est là que tout empire. Il n'est pas touché par le doute : il comprend vite, et il choisit d'imposer une version publique où Sarah passe pour instable (sa dépression, son traitement, ses médicaments mal pris), plutôt que d'affronter ce que sa propre survie révèle. Dans une tension déjà montée trop haut, personne n'a plus la force de la défendre. La soirée produit deux survivants qui avaient tous les deux quelque chose à cacher, et un seul d'entre eux avait le pouvoir social de choisir lequel des deux secrets allait compter.",
    lastLine: 'La soirée a produit deux survivants qui avaient tous les deux quelque chose à cacher.',
  },
  E1: {
    title: 'Inès co-coupable',
    short: 'Noé survit. Le mobile financier sort au jour. Inès savait, et s’est tue.',
    detail: "Noé survit à l'hôpital, comme dans la version la plus canonique de cette nuit-là. Mais ce qui remonte ensuite ne concerne pas seulement Maëlys : un virement resté dans un tiroir, un vocal qu'il n'aurait jamais dû laisser traîner, une colonne de chiffres dans un carnet : la dette que Noé traînait envers Maëlys depuis des années finit par sortir, elle aussi. Et Inès, qui a toujours été celle qui répare, qui couvre, qui range avant que ça ne se voie, avait vu quelque chose dans cette cuisine bien avant l'incident : des boîtes qu'elle a rangées mentalement sans y penser vraiment, ou un silence qu'elle a laissé s'installer une fois de trop pendant l'aftermath, quand poser la question qui dérange aurait tout changé. Elle n'a rien préparé, rien versé dans une assiette. Mais elle savait, et elle n'a rien dit. Pas par malveillance : par habitude d'être celle qui protège son frère de tout, y compris de la vérité. Ce n'est pas elle qui a empoisonné personne. C'est elle qui a laissé le silence faire le reste.",
    lastLine: "Elle a toujours été celle qui répare. Cette fois, il n'y avait rien à réparer, juste à se taire.",
  },
  E2: {
    title: 'Solidarité toxique',
    short: 'Noé survit. Sarah savait pour Maëlys. Elle a choisi de couvrir, quand même.',
    detail: "Noé survit à l'hôpital. Mais Sarah, dans cette version de la nuit, n'est pas seulement une victime collatérale de la mécanique de Maëlys : elle porte, depuis des années, un lien avec elle que personne d'autre à cette table n'a jamais soupçonné. Une photo de vacances laissée bien en évidence dans le couloir, un SMS jamais envoyé resté en brouillon, un regard que Maëlys a fini par lui accorder une seule fois dans toute la soirée, contre son habitude de ne jamais la regarder en face : les traces d'une proximité ancienne, coupée sans explication, que Sarah n'a jamais vraiment comprise. Alors, à la fin, quand tout le monde attend qu'elle parle (elle qui a le plus de raisons de le faire), Sarah se lève et part sans qu'on le lui ait demandé. Pas parce qu'elle ne sait pas. Parce qu'elle sait, précisément, et que ce qu'elle protège encore, malgré tout ce qui vient de se passer, c'est Maëlys. Ce n'est pas de la lâcheté au sens simple du mot. C'est une loyauté plus vieille que la soirée, et plus abîmée qu'elle n'y paraît.",
    lastLine: "Ce n'est pas qu'elle ne savait pas. C'est qu'elle a choisi, encore une fois, de protéger la mauvaise personne.",
  },
  E3: {
    title: 'Preuve effacée',
    short: 'Noé survit. La photo qui aurait pu tout prouver existait. Elle a disparu avant de compter.',
    detail: "Noé survit à l'hôpital. Quelque part dans la soirée, à 21h47, Yanis a pris une photo sans savoir ce qu'il capturait vraiment : le passe, les assiettes en ligne, et dans le reflet de la vitre du cellier, un geste que personne n'était censé voir. Cette photo existe. Elle est sur son téléphone, mêlée à des dizaines d'autres clichés de soirée sans importance. Mais avant que quiconque d'autre ne pense à la regarder vraiment, Maëlys, qui gère déjà tout, qui range, qui construit le récit phrase après phrase, demande à voir le téléphone de Yanis, discrètement, sous un prétexte anodin. Elle trouve ce qu'elle cherchait. Ce qui aurait pu être la preuve irréfutable, celle qui aurait changé toute l'issue de cette nuit, disparaît avant que sa valeur n'ait été comprise par personne d'autre qu'elle. Yanis ne se rend compte de rien. Il a juste, sans le vouloir, été le complice involontaire d'une preuve qu'il ne savait même pas avoir prise.",
    lastLine: "La preuve a existé. Le temps qu'on comprenne ce qu'elle montrait, elle n'existait déjà plus.",
  },
  F9: {
    title: 'Justice formelle',
    short: 'Noé survit. La photo a été vue. Quelqu\'un a appelé la police. La vérité a un prix, elle aussi.',
    detail: "Noé survit à l'hôpital. La photo que Yanis a prise à 21h47 sans le savoir a fini par être regardée, vraiment regardée, par quelqu'un qui a compris ce qu'elle montrait. Et cette fois, ça ne s'arrête pas à une conversation entre deux personnes qui savent, dans un couloir, à voix basse. Quelqu'un décroche le téléphone. La police est prévenue. Ce n'est pas la fin la plus spectaculaire (personne ne meurt sur le coup, personne n'avoue publiquement), mais c'est la seule où la preuve quitte le cercle de ceux qui étaient à table ce soir-là, pour devenir quelque chose que d'autres, à l'extérieur, vont devoir examiner. Maëlys ne contrôle plus le récit. Pour la première fois de la soirée, ce n'est plus elle qui décide de ce qui va se dire. Mais la justice a un prix que personne n'avait mesuré à l'avance. L'enquête s'étire sur des mois. Les dépositions se contredisent, se répètent, s'épuisent. Le groupe qui existait avant cette soirée n'existe plus après : certains ne se reverront plus jamais, même au tribunal.",
    lastLine: "La vérité est sortie. Personne, pour autant, n'a vraiment gagné quoi que ce soit.",
  },
  F13: {
    title: 'Yanis comprend',
    short: 'Noé survit. La photo a été vue et comprise. Personne n\'a appelé la police. Le silence a un poids, lui aussi.',
    detail: "Noé survit à l'hôpital. La photo prise par Yanis à 21h47 a fini par être regardée de près : le reflet, le geste, la position des assiettes, tout y est. Quelqu'un comprend ce qu'elle montre vraiment. Mais personne ne va plus loin : pas de police, pas de dossier officiel. La vérité tient, mais elle reste privée, portée par une poignée de personnes qui savent désormais avec certitude ce qui s'est passé, sans que ça change quoi que ce soit à la version que le reste du monde va entendre. Yanis, lui, ne se remettra pas tout à fait d'avoir tenu, sans le savoir, la preuve dans sa poche toute la soirée. Il ne dira jamais ce qu'il sait vraiment. Mais quelque chose change en lui, de façon irréversible : il ne regarde plus Maëlys, ni même les autres, tout à fait de la même manière. Il s'éloigne, doucement, sans jamais donner de vraie raison. Le groupe se dissout, un an plus tard, sans éclat, juste à force de faire semblant.",
    lastLine: "Il avait la preuve depuis le début. Il ne le savait juste pas encore. Ça ne l'a jamais vraiment allégé.",
  },
  F_SAMU_TOT: {
    title: 'Le geste au bon moment',
    short: 'Le SAMU a été appelé tout de suite, sans attendre. Le seul geste vraiment net de la soirée, et il a aussi un prix.',
    detail: "Dans le couloir, pendant que tout le monde hésite, quelqu'un décroche son téléphone et appelle le SAMU, immédiatement, sans consulter personne, sans attendre que Maëlys ne reprenne le contrôle de la situation. Ce n'est pas un geste spectaculaire. Ce n'est pas une accusation. C'est juste la seule décision de toute la soirée qui n'a pas hésité, qui n'a pas pesé le pour et le contre, qui n'a pas attendu de voir ce que les autres allaient faire. Noé survit, comme dans beaucoup d'autres versions de cette nuit, mais cette fois, sa survie doit un peu moins au hasard. Mais ce geste a aussi une conséquence que personne n'avait anticipée. L'intervention si rapide des secours déclenche un signalement, une enquête que plus personne ne contrôle. Le groupe survit à cette nuit-là, mais il ne s'en remet jamais tout à fait. Celui qui a appelé sait qu'il a bien fait. Ça ne l'empêche pas d'être, pour les autres, celui qui a tout fait basculer.",
    lastLine: "Il a sauvé une vie, cette nuit-là. Il a aussi perdu, sans le vouloir, la confiance de tous les autres.",
  },
  F_INES_PIVOT: {
    title: 'Le poids du silence d\'Inès',
    short: 'Inès a vu, ou s\'est tue, à un moment de la soirée. Cette complicité muette finit par peser sur elle.',
    detail: "Noé survit à l'hôpital. Mais dans les jours qui suivent, c'est Inès qui porte le plus lourd, en silence. Elle a vu quelque chose dans cette cuisine, bien avant l'incident, ou elle s'est tue une fois de trop pendant l'aftermath, quand poser la question qui dérange aurait pu tout changer. Elle n'a rien préparé, rien versé dans une assiette. Elle a fait ce qu'elle a toujours fait : protéger, couvrir, ranger avant que ça ne se voie. Mais cette fois, la protection qu'elle offrait sans le vouloir n'était pas à celui qui en avait besoin.",
    lastLine: "Elle a toujours été celle qui protège. Personne ne lui a jamais demandé ce que ça lui coûtait.",
  },
  F_YANIS_PART: {
    title: 'Yanis est parti avant',
    short: 'Yanis a proposé de partir avant même l\'incident. Un instinct qu\'il n\'a pas su nommer, mais qui n\'était pas faux.',
    detail: "Sur la terrasse, avant que le service ne commence vraiment, Yanis propose à Lucas qu'ils partent tous les deux : une intuition qu'il n'aurait pas su justifier sur le moment, un malaise diffus qu'il attribue à la fatigue ou à trop de vin. Il ne saura jamais avec certitude ce qu'il a évité en insistant. Ce doute-là ne le quitte plus vraiment. Des années après, il rejoue cette soirée dans sa tête, sans jamais obtenir de réponse, sans jamais oser la demander à voix haute. Noé survit, comme dans la plupart des versions de cette nuit, mais Yanis n'est plus vraiment là pour la suite, et c'est peut-être la chose la plus lucide qu'il ait faite de toute la soirée, sans jamais comprendre pourquoi.",
    lastLine: "Il n'a jamais su ce qu'il avait évité. Il a juste eu raison, une fois, sans preuve, et ça ne l'a jamais vraiment rassuré.",
  },
  F14: {
    title: 'Le silence de groupe',
    short: 'Noé survit. Rien ne s\'est jamais vraiment mis en mouvement cette nuit-là. C\'est bien ce qui devrait inquiéter.',
    detail: "Noé survit à l'hôpital. Mais ce qui frappe, en y repensant, c'est à quel point rien n'a jamais vraiment dérapé. Personne n'a interrompu le morpion. Personne n'a interrompu le service. Personne n'a confronté personne. La tension, dans la maison, n'est jamais montée bien haut, un dîner presque ordinaire, en apparence, jusqu'à l'incident lui-même. C'est une fin étrangement calme, et c'est précisément ce calme qui devrait inquiéter : la mécanique de Maëlys n'a rencontré aucune résistance nulle part, à aucun moment, parce que personne n'a jamais rien vu venir d'assez fort pour réagir.",
    lastLine: "Rien n'a jamais vraiment dérapé. C'est bien ce qui est le plus inquiétant.",
  },
  F_SARAH_MORT: {
    title: 'Sarah ne revient pas',
    short: 'Ce n\'est pas un meurtre. C\'est une succession de silences.',
    detail: "Sarah s'écroule, comme dans tant d'autres versions de cette nuit. Mais cette fois, personne n'a appelé le SAMU tout de suite. Personne n'a interrompu le service. Personne ne l'a prévenue, plus tôt dans la soirée, qu'elle avait oublié son traitement. Et Noé, qui savait depuis le début qu'elle était fragile ce soir, sans médicaments, avec de l'alcool, n'a rien fait non plus, à aucun moment où ça aurait compté. Il n'y avait pas de meurtre prémédité contre elle. Juste une accumulation de décisions individuellement défendables, attendre, ne pas s'en mêler, faire confiance à quelqu'un d'autre pour agir, qui, mises bout à bout, deviennent irréversibles. Cette fois, la réaction est trop sévère. Elle ne revient pas de cette nuit.",
    lastLine: "Personne n'a voulu ça. C'est bien pour ça que personne n'a rien fait.",
  },
  F_NOE_MORT_SILENCE: {
    title: 'Noé ne revient pas',
    short: 'La tension est montée trop haut. Cette fois, personne n\'a parlé à temps, et Noé n\'a pas survécu.',
    detail: "Le service se déroule comme tant d'autres fois cette nuit-là, sauf que rien ne redescend. Aucune interruption, aucune confrontation, aucun mot de trop qui aurait pu faire dérailler la mécanique avant la fin. La tension monte, encore, encore, jusqu'à un point que personne n'avait anticipé. Noé mange. Cette fois, la détresse ne s'arrête pas à l'hôpital. Personne n'a rien vu venir d'assez fort pour agir avant qu'il ne soit trop tard. Le silence, qui avait tenu toute la soirée, finit par tout recouvrir, y compris sa mort.",
    lastLine: "Personne n'a parlé. C'est peut-être pour ça que personne ne s'est arrêté à temps.",
  },
  F_NOE_MORT_VERITE: {
    title: 'La vérité, trop tard pour lui',
    short: 'Noé n\'a pas survécu. Mais cette fois, les preuves se sont assemblées, et quelqu\'un a fini par parler.',
    detail: "La tension est montée trop haut, et la mécanique est allée jusqu'au bout cette fois : Noé ne survit pas à cette nuit-là. Mais dans les jours qui suivent, ce qui aurait dû rester enterré ne le reste pas. La photo que Yanis a prise sans comprendre, le vocal que Lucas n'a jamais effacé, une parole enfin dite à voix haute : les fragments s'assemblent, et cette fois, ils ne laissent plus de place au doute. Maëlys ne peut plus tenir la version qu'elle avait préparée. La vérité sort de la maison. Elle arrive trop tard pour Noé, mais pas trop tard pour que ça compte encore pour les autres.",
    lastLine: "La vérité est sortie. Elle n'a sauvé personne, mais elle a fini par compter.",
  },
  F_NOE_MORT_RECIT_FAUX: {
    title: 'Le récit qui reste',
    short: 'Noé n\'a pas survécu. Le récit qui sort de la maison désigne Sarah, pas Maëlys.',
    detail: "La tension a fini par produire ce que personne, dans la maison, n'avait vraiment envie d'admettre pouvoir arriver : Noé ne survit pas à cette nuit-là. Mais avant même que le choc ne retombe, une version se met déjà en place, portée par ceux qui ont le plus intérêt à ce qu'elle tienne. Sarah, sa fragilité connue de tous, ses médicaments, son passé : elle devient, dans le récit qui circule, la cause plutôt que la victime collatérale d'un mécanisme qu'elle n'a jamais déclenché. Personne n'a la force de contester cette version-là, pas cette nuit, peut-être plus jamais. Maëlys reste, dans l'ombre de cette histoire, celle qui n'a jamais eu à répondre de rien.",
    lastLine: "Il est mort. Et c'est encore elle qu'on accuse.",
  },
  F_NOE_DISPARAIT: {
    title: 'Noé disparaît',
    short: 'Sarah lui a montré, sans un mot, ce qu\'il savait. Il n\'est jamais revenu.',
    detail: "Noé sort de l'hôpital, survit à sa propre soirée. Plus tard, il vient voir Sarah. Pas pour s'excuser vraiment : plutôt pour lui demander de ne « rien compliquer ». Sarah ne dit rien. Elle lui montre simplement une dernière preuve de ce qu'il savait depuis le début, sans commentaire, sans reproche formulé à voix haute. Noé ne répond pas. Il quitte la pièce. Il ne repart pas à l'hôpital, il ne rappelle pas, il ne réapparaît jamais vraiment dans la vie de qui que ce soit qui était présent ce soir-là. Personne n'a menti, à la fin. Personne n'a vraiment dit la vérité non plus. Sarah a juste montré une preuve que personne n'était prêt à regarder en face, sauf Noé, une seule fois, et ça a suffi à le faire disparaître.",
    lastLine: "Personne n'a menti. Personne n'a vraiment dit la vérité. Elle a juste montré une preuve que lui seul devait voir.",
  },
  F_SARAH_RETOURNE: {
    title: 'Sarah se retourne contre Noé',
    short: 'Elle a compris qu\'il savait. Et qu\'il n\'avait rien fait. Elle a appelé Lucas pour le dire.',
    detail: "Noé survit. Sarah aussi. Mais dans les jours qui suivent, elle comprend quelque chose que personne d'autre n'a assemblé aussi précisément : Noé savait qu'elle était fragile ce soir-là, il le savait avant même que la soirée ne commence, et il n'a rien fait pour la protéger : ni l'avertir, ni s'interposer, ni même la regarder vraiment. Elle appelle Lucas, la seule personne dont elle est sûre qu'il l'écoutera sans essayer de gérer l'histoire à sa place. Ce n'est pas une explosion publique. C'est un coup de fil, tard le soir, qui change durablement ce que Sarah est prête à encore excuser chez Noé, et ce n'est plus grand-chose.",
    lastLine: "Elle n'a pas crié. Elle a juste arrêté de faire comme si elle ne savait pas.",
  },
  F_SARAH_SAIT_ET_COUVRE: {
    title: 'Sarah sait et se tait',
    short: 'Elle a compris. Elle a choisi de se taire, une fois de plus.',
    detail: "Noé survit. Sarah aussi, et elle comprend, dans les jours qui suivent, ce qu'il savait et n'a pas fait ce soir-là. Mais elle ne dit rien. Pas à Lucas, pas à personne. C'est un choix, pas un oubli : la même dépendance affective qui l'a tenue toute la soirée, la même habitude de porter seule ce qui devrait être partagé. Ce n'est pas la fin la plus spectaculaire. C'est peut-être la plus triste : elle a toutes les pièces du puzzle, et elle décide, consciemment, de ne jamais les assembler à voix haute.",
    lastLine: "Elle savait. Elle a choisi, une fois de plus, de porter ça seule.",
  },
  F_RUPTURE_FINALE: {
    title: 'La rupture finale',
    short: 'Elle lui a dit de partir. Une bonne fois pour toutes.',
    detail: "Noé survit. Il vient voir Sarah, plus tard, pour lui demander de ne « rien compliquer ». Cette fois, elle ne se tait pas et elle ne cherche pas non plus à comprendre ce qu'il ressent. Elle lui dit, simplement et fermement, de partir : de ne plus jamais revenir lui demander quoi que ce soit. Ce n'est pas une révélation publique, ce n'est pas une vengeance. C'est une porte qui se ferme, pour de bon, sur une histoire que Sarah a fini par comprendre n'avoir jamais eu besoin de porter.",
    lastLine: "Elle n'a rien révélé à personne. Elle a juste arrêté de lui laisser une place.",
  },
}
