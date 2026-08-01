# Sous la nappe — Expansion v3 : nouvelles histoires, interactions et indices

> Document daté du 2026-08-01.  
> Complément direct de `docs/roadmap-v2-expansion.md`.  
> Objectif : enrichir la chronologie sans la rompre, ajouter des interactions croisées entre personnages dans les chapitres existants, créer 4 nouvelles histoires de fond, introduire 18 nouveaux indices (C-26 à C-43), et décrire les scènes inter-chapitres à insérer dans le fil narratif actuel.

---

## Chronologie complète avec insertions

```
ACTE 0 (flashback, run 2+)
  S00a — Maëlys prépare la cuisine            [NOUVEAU]
  S00b — Appel de Noé en retard               [NOUVEAU]
  S00c — Inès arrive trop tôt                 [NOUVEAU]

ACTE 1 — Avant le dîner
  S01 — Mémoire d'ouverture                   [existant]
  S01b — La conversation de palier             [NOUVEAU — inséré entre S01 et S02]
  S02 — Arrivée                               [existant]
  S02b — Le téléphone de Yanis               [NOUVEAU — inséré entre S02 et S03]
  S03 — Premiers échanges                     [existant]
  S03b — La confidence de Sarah               [NOUVEAU — inséré entre S03 et S04]

ACTE 2 — Le dîner
  S04 — Installation à table                  [existant]
  S04b — L'échange de regards                 [NOUVEAU — inséré entre S04 et S05]
  S05 — Jeu social 1                          [existant]
  S05b — La remarque d'Inès                   [NOUVEAU — inséré entre S05 et S06]
  S06 — Aparté cuisine                        [existant]
  S06b — Lucas et Yanis dehors                [NOUVEAU — inséré entre S06 et S07]
  S07 — Jeu social 2                          [existant]
  S07b — La demande de Noé à Lucas            [NOUVEAU — inséré entre S07 et S08]
  S08 — Service critique                      [existant]
  S09 — Incident                              [existant]
  S09b — Le couloir après l'incident          [NOUVEAU — inséré entre S09 et S10]
  S10 — Aftermath                             [existant]
  S11 — Reconstruction                        [existant]

ACTE 3 (post-hôpital, si Noé touché)
  S12 — Couloir hôpital                       [NOUVEAU]
  S13 — Retour de Maëlys                      [NOUVEAU]
  S14 — Le lendemain matin                    [NOUVEAU]
```

Total : **11 scènes existantes + 14 nouvelles = 25 scènes**

---

## Nouvelles histoires de fond

### Histoire 1 — Lucas et Noé : la vraie rupture

**Contexte :** Lucas et Noé étaient proches, professionnellement et personnellement. Il y a deux ans, Noé a discracement retiré Lucas d'un projet commun pour mettre Inès à sa place, sans explication. Lucas sait. Il n'a jamais rien dit. Sa neutralité ce soir n'est pas de l'indifférence — c'est de la rancune contrôlée.

**Ce que ça change :**
- `lucasProtectionNoe` est une protection ambiguë : il le protège par habitude, pas par affection
- Si `lucasLucidite > 80` ET `lucasProtectionNoe < 45` → Lucas peut choisir de ne pas couvrir Noé dans la reconstruction
- Débloque la branche `lucas_abandonne_noe` en S11

**Nouvelles variables**
```json
"lucasRancuneNoe": 55,
"lucasProjetPerdu": true
```

**Nouveaux indices**

| Ref | Label | Où | POV | Fiabilité | Prouve | Induit en erreur |
|---|---|---|---|---|---|---|
| C-26 | Email de Noé anonçant le retrait de Lucas, jamais effacé | Téléphone Lucas, S02 | lucas | haute | Noé a évincé Lucas intentionnellement | Qu'il avait une bonne raison professionnelle |
| C-27 | Lucas fait une pause avant de répondre à Noé en S03 | Table 20h55 | maelys, ines | faible | Tension non dite entre les deux | Qu'il cherche ses mots |
| C-28 | Yanis ne sait pas pourquoi Lucas et Noé sont "moins proches" | Salon, S03 | yanis | faible | Quelque chose s'est passé hors-scène | Qu'ils se sont éloignés naturellement |

---

### Histoire 2 — Yanis a failli ne pas venir

**Contexte :** Yanis a été invité en remplacement de quelqu'un d'autre — un ami commun qui a décliné trois jours avant. Il ne le sait pas clairement. Il a reu une invitation chaíException et l'a acceptée par curiosité et parce que Maëlys lui a demandé personnellement, avec insistance. Cette insistance est étrange. Yanis n'a jamais compris pourquoi elle tenait tant à sa présence.

**Ce que ça change :**
- Maëlys avait besoin d'un joker social — quelqu'un d'assez insouciant pour ne pas tout observer
- Le placement de Yanis en siège 6 (loin du passe) est voulu
- Si `yanisInsouciance` descend sous 45, Yanis commence à devenir dangereux pour Maëlys

**Nouvelles variables**
```json
"yanisInvitationForce": true,
"yanisDoute": 0,
"maelysBesoinDeYanis": true
```

**Nouveaux indices**

| Ref | Label | Où | POV | Fiabilité | Prouve | Induit en erreur |
|---|---|---|---|---|---|---|
| C-29 | Maëlys a appelé Yanis deux fois pour confirmer sa venue | Salon, S01 accessible POV Yanis | yanis | moyenne | Elle avait besoin qu'il soit là spécifiquement | Qu'elle était anxieuse pour la soirée |
| C-30 | Yanis trouve une vieille invitation à un autre nom dans l'entrée | Couloir S02 POV Yanis | yanis | haute | Il est là à la place de quelqu'un d'autre | Que c'est un oubli |
| C-31 | Maëlys place Yanis à la table la plus loin du passe sans lui demander son avis | S04 visible tous | all | faible | Elle gère la proximité au passe | Politesse ou habitude d'hôte |

---

### Histoire 3 — Noé et Sarah : relation effacée

**Contexte :** Noé et Sarah ont eu une brève relation il y a trois ans. Sarah a mis fin. Noé ne l'a jamais vraiment accepté. Il a reconstruit une version où il est parti. Ce soir, Sarah est là, sous le même toit que Maëlys, et Noé jongle entre deux versions de lui-même. Les messages supprimés (C-23) ne cachent pas uniquement de l'argent — ils cachent des demandes de reprise de contact récentes.

**Ce que ça change :**
- `noeMensonge` reçoit un bonus de +8 si le joueur découvre C-23 ET C-32
- Sarah n'est pas véritablement surprise d'être là — elle savait que Noé serait présent
- `sarahDependanceMaelys` est aussi une dépendance affective de remplacement post-Noé

**Nouvelles variables**
```json
"noeRelationSarah": "ended_badly",
"sarahSaitPourNoe": true,
"noeTentativeReprise": true
```

**Nouveaux indices**

| Ref | Label | Où | POV | Fiabilité | Prouve | Induit en erreur |
|---|---|---|---|---|---|---|
| C-32 | Notification push non lue de Noé à Sarah, 3 semaines avant | Téléphone Sarah POV Sarah S02 | sarah | haute | Noé a essaié de renouer récemment | Que c'est professionnel |
| C-33 | Sarah et Noé ne se regardent pas en arrivant | S02 visible tous | all | faible | Histoire passée et tension résiduelle | Qu'ils se connaissent peu |
| C-34 | Maëlys connait la relation Sarah/Noé — Inès le lui a dit | Dialogue Inès/Maëlys S03 POV Lucas | lucas, ines | moyenne | Maëlys avait une raison de plus de gérer Sarah ce soir | Commérage banal |

---

### Histoire 4 — Inès protectrice depuis l'enfance

**Contexte :** Inès a toujours couvert Noé. Depuis enfance, elle est celle qui répare. Sa franchise sèche cache un attachement irrationnel à son frère. Ce soir, elle sent que quelque chose ne va pas avant tout le monde — mais elle classe l'information comme une anxiété d'elle-même, pas comme une alarme extérieure. C'est son angle mort central.

**Ce que ça change :**
- `inesCompliciteMorale` peut monter plus vite si le joueur joue Inès et observe les bons indices
- Si `inesCompliciteMorale > 70` ET `inesSilenceActif = true` → Inès ne peut plus quitter la soirée proprement
- Débloque branche `ines_se_retourne_contre_noe` si elle comprend que Noé était la cible prévue

**Nouvelles variables**
```json
"inesAttachementNoe": 85,
"inesAlarmeSilencieuse": false,
"inesSeRetoureContreNoe": false
```

**Nouveaux indices**

| Ref | Label | Où | POV | Fiabilité | Prouve | Induit en erreur |
|---|---|---|---|---|---|---|
| C-35 | Inès vérifie discrètement l'état de Noé entre chaque plat | Table S07 POV Lucas | lucas | faible | Elle surveille son frère sans le montrer | Qu'elle est attentionnée |
| C-36 | Inès a reconnu le récipient en grès dans la cuisine — elle en avait un identique | Cuisine S06 POV Inès | ines | haute | Elle sait ce que c'est. Elle n'a rien dit. | Qu'elle n'y a pas prêté attention |
| C-37 | Inès appelle Noé par son surnom d'enfance une seule fois | Table S08 accessible tous | all | faible | Moment de panique intérieure dissimulée | Tendresse fraternelle ordinaire |

---

## Nouvelles scènes inter-chapitres

### S01b — La conversation de palier
*Inserée entre S01 et S02. Durée : courte. 4 actions par perso concerné.*

**Contexte :** Dans le couloir, juste après l'arrivée de Lucas, Maëlys l'intercepte une fraction de seconde avant qu'il entre dans le salon. Elle lui dit quelque chose de très court. Lucas ne comprend pas tout de suite.

**Enjeu :** Maëlys teste si Lucas se souvient de la brouille avec Noé. Si oui, elle peut l'utiliser. Si non, il est un observateur neutre.

**Actions disponibles par POV**
```
POV Lucas :
  a) Répondre directement            → lucasNeutralite -3, lucasLucidite +4
  b) Sourire sans répondre           → lucasNeutralite +4, lucasRancuneNoe +5
  c) Chercher la signification        → lucasLucidite +7, flag [lucas_note_palier]
  d) Ignorer et entrer                → lucasNeutralite +5, socialTension -1

POV Maëlys :
  a) Dire la phrase directement       → maelysControle +3, socialTension +2
  b) Poser une question à la place    → maelysAmbivalence +5, lucasProtectionNoe -4
  c) Touchér le bras de Lucas         → maelysPanic +3, flag [maelys_teste_lucas]
  d) Laisser entrer sans parler        → maelysControle -3, socialTension -1
```

**Nouveaux indices déclenchables**
- Si `[lucas_note_palier]` + S06 reflet → C-38 disponible
- Si `[maelys_teste_lucas]` → `lucasProtectionNoe -5` supplémentaire

---

### S02b — Le téléphone de Yanis
*Insérée entre S02 et S03. Courte.*

**Contexte :** Yanis reçoit un message pendant que tout le monde enlève son manteau. Il sourit. Quelqu'un lui demande ce que c'est. Il dit « Rien, une blague ». Mais si le joueur joue Yanis, on voit le message : c'est l'ami remplacé qui lui demande comment c'est.

**Enjeu :** Déclenche `yanisDoute` si Yanis répond honnêtement. Active l'intrigue C.

**Actions**
```
POV Yanis :
  a) Répondre « super soirée »         → yanisInsouciance +4, yanisDoute 0
  b) Envoyer juste un emoji             → yanisInsouciance +2, yanisDoute +5
  c) Ne pas répondre, ranger           → yanisDoute +10, flag [yanis_doute_invitation]
  d) Demander à Maëlys pourquoi il est là  → yanisInsouciance -8, maelysPanic +6, C-29 révélé

POV Lucas :
  a) Observer la réaction de Yanis     → lucasLucidite +4, C-30 accessible
  b) Engager la conversation            → lucasNeutralite +3, socialTension +1
  c) Demander qui c'était              → lucasLucidite +5, yanisDoute +5
  d) Ignorer                            → lucasNeutralite +4
```

---

### S03b — La confidence de Sarah
*Insérée entre S03 et S04. Courte.*

**Contexte :** Sarah prend Lucas à part pendant que les autres sont au salon. Elle lui dit qu'elle a oublié ses médicaments ce soir. Elle le dit légèrement, comme une information sans importance. Lucas enregistre.

**Enjeu :** C'est la confirmation directe de `sarahMedication = forgotten`. Si Lucas joue bien ses cartes ici, c'est un indice majeur disponible dès S03.

**Actions**
```
POV Lucas :
  a) Lui dire de rentrer les chercher  → lucasCourage +6, sarahStabilite +12, flag [lucas_previent_sarah]
  b) Noter mentalement, ne rien dire   → lucasLucidite +8, flag [lucas_sait_medicaments]
  c) Minimiser                         → lucasNeutralite +4, sarahStabilite -4
  d) Changer de sujet                  → lucasNeutralite +5, lucasCourage -5

POV Sarah :
  a) Insister sur l'importance         → sarahMemoire +8, sarahStabilite -3
  b) Faire comme si ce n'était rien    → sarahStabilite +3, sarahMemoire -3
  c) Demander si Maëlys a des médics  → sarahDependanceMaelys +5, flag [sarah_demande_maelys]
  d) Retourner au salon                → sarahStabilite +2, socialTension -1
```

**Nouveaux indices déclenchables**
- Si `[lucas_previent_sarah]` actif et Sarah part chercher ses médics → elle n'est pas serviceHelper → `targetActual` peut changer → ouvre branche alternative
- Si `[sarah_demande_maelys]` → Maëlys dit qu'elle n'a rien → C-39 disponible

---

### S04b — L'échange de regards
*Insérée entre S04 et S05. Très courte, 2 actions maximum par perso.*

**Contexte :** Tout le monde est assis. Une seconde suspendue. Maëlys regarde le passe. Noé regarde Maëlys. Sarah regarde Noé. Lucas regarde Maëlys. Inès regarde personne. Yanis regarde son téléphone.

**Enjeu :** C'est une scène de lecture pure — le joueur n'a que 2 actions mais elles comptent double sur `lucasLucidite` et `maelysControle`.

**Actions**
```
POV Lucas :
  a) Suivre la ligne de regard de Maëlys    → lucasLucidite +10, C-08 révélé
  b) Observer Noé plutôt                   → lucasLucidite +5, C-17 accessible plus tôt

POV Maëlys :
  a) Détourner le regard avant Lucas        → maelysControle +8
  b) Soutenir le regard de Lucas            → maelysPanic +6, flag [lucas_a_croise_maelys]
```

---

### S05b — La remarque d'Inès
*Insérée entre S05 et S06. Courte.*

**Contexte :** Après le premier jeu social, Inès dit quelque chose sur la façon dont Sarah « tient » le vin. La remarque passe. Mais Maëlys l'enregistre — et note que personne ne défend Sarah, pas même Noé.

**Enjeu :** Catalyseur de `maelysColere` si Noé ne répond pas. Si Lucas intervient, `inesTensionSociale` monte fort.

**Actions**
```
POV Lucas :
  a) Défendre Sarah directement        → lucasCourage +8, inesTensionSociale +10, sarahStabilite +6
  b) Regarder Noé pour qu'il réagisse  → lucasRancuneNoe +6, noeLachete +5
  c) Rire avec Inès                    → lucasNeutralite +5, sarahStabilite -6, lucasCourage -5
  d) Changer de sujet                  → socialTension -2, lucasCourage -4

POV Noé :
  a) Défendre Sarah                    → noeLachete -8, noeInfluenceMaelys -5, maelysColere +8
  b) Sourire sans répondre             → noeLachete +6, noeMensonge +4
  c) Valider la remarque d'Inès        → noeCruaute +8, sarahStabilite -8, maelysColere -5
  d) Demander à Maëlys de servir      → noeLachete +4, maelysControle -4, socialTension +2

POV Maëlys :
  a) Laisser faire                     → maelysColere +6, maelysControle +4
  b) Sourire vers Sarah                → maelysAmbivalence +8, maelysPanic +4
  c) Couper la remarque d'Inès         → inesTensionSociale +12, maelysControle -5
  d) Se lever pour aller à la cuisine  → maelysControle +6, flag [maelys_vers_cuisine_s05b]
```

---

### S06b — Lucas et Yanis dehors
*Insérée entre S06 et S07. Courte.*

**Contexte :** Lucas sort prendre l'air. Yanis le suit. Sur la terrasse, ils parlent deux minutes. Yanis mentionne que l'ami qu'il remplace ce soir avait refusé « parce que Maëlys lui faisait peur depuis un moment ». Il dit ça en riant. Lucas ne rit pas.

**Enjeu :** Indice capital sur l'intention de Maëlys. Accessible seulement si `[yanis_doute_invitation]` actif ET Lucas est sur la terrasse.

**Actions**
```
POV Lucas :
  a) Demander le nom de l'ami          → lucasLucidite +8, C-40 révélé
  b) Demander ce que Yanis veut dire   → lucasLucidite +6, yanisDoute +8
  c) Minimiser, rentrer                → lucasNeutralite +4, lucasCourage -4
  d) Appeler l'ami de Yanis           → lucasLucidite +12, flag [lucas_contact_ami_yanis], C-41 révélé

POV Yanis :
  a) Raconter l'anecdote en entier    → yanisInsouciance -8, yanisDoute +12, C-40 révélé
  b) S'arrêter au milieu              → yanisDoute +6, socialTension +2
  c) Changer de sujet                 → yanisInsouciance +3, yanisDoute -4
  d) Proposer de partir tous les deux → yanisInsouciance -10, maelysPanic +8, flag [yanis_veut_partir]
```

---

### S07b — La demande de Noé à Lucas
*Insérée entre S07 et S08. Très courte, pivot moral.*

**Contexte :** Noé attrape Lucas au passage vers les toilettes. Il lui dit « Si ce soir ça dérape, tu ne répètes rien ». Il ne précise pas quoi. Lucas comprend que Noé sait quelque chose. Ou qu'il se couvre.

**Enjeu :** C'est le moment où `lucasProtectionNoe` se fixe pour la suite. Réponse courte, impact long.

**Actions**
```
POV Lucas :
  a) Acquiescer sans parler            → lucasProtectionNoe +12, lucasRancuneNoe +8, lucasCourage -5
  b) Demander « quoi ? »               → lucasLucidite +8, lucasProtectionNoe -5, flag [lucas_questionne_noe]
  c) Refuser nettement                 → lucasCourage +12, lucasProtectionNoe -15, noeLachete +5
  d) Promettre puis noter              → lucasNeutralite +5, flag [lucas_promet_mais_note], C-26 accessible

POV Noé :
  a) Partir sans attendre la réponse  → noeLachete +5, noeMensonge +5
  b) Insister si Lucas hésite          → noeCruaute +6, lucasRancuneNoe +10
  c) Minimiser (« c'était une blague»)  → noeMensonge +8, lucasLucidite +5
  d) Avouer à demi-mot               → noeLachete -6, noeInfluenceMaelys -10, C-42 révélé
```

---

### S09b — Le couloir après l'incident
*Insérée entre S09 et S10. Courte mais dense.*

**Contexte :** Sarah est dans la salle de bain. Les autres sont dans le couloir, debout, à ne pas savoir quoi faire. Maëlys arrive la première. Elle prend le contrôle. Lucas est juste derrière elle.

**Enjeu :** Dernière occasion d'agir avant la reconstruction du récit. C'est ici que le silence ou l'action de Lucas devient irréversible.

**Actions**
```
POV Lucas :
  a) Prendre une photo discrète du couloir  → lucasLucidite +6, flag [lucas_photo_couloir], C-43 révélé
  b) Demander à Maëlys ce qui s'est passé  → lucasCourage +8, maelysPanic +10, socialTension +4
  c) Appeler le SAMU immédiatement          → lucasCourage +15, maelysControle -10, flag [samu_appele_tot]
  d) Attendre que quelqu'un d'autre agisse   → lucasNeutralite +5, lucasCourage -8, socialTension -2

POV Maëlys :
  a) Prendre le contrôle du couloir         → maelysControle +10, maelysPanic -4
  b) Regarder le téléphone de Yanis         → maelysASuPhoto possible, flag [maelys_cherche_photo]
  c) Aller chercher les affaires de Sarah    → maelysAmbivalence +8, C-18 accessible
  d) Bloquer l'accès à la cuisine           → maelysControle +6, lucasLucidite +8 si Lucas remarque

POV Inès :
  a) Appeler Noé depuis le couloir           → inesAttachementNoe +5, inesSilenceActif +10
  b) Demander à Maëlys ce qu'elle a donné   → inesCompliciteMorale -10, inesTensionSociale +12
  c) S'occuper de Sarah seule               → inesCompliciteMorale +8, sarahStabilite +6
  d) Rester en retrait                      → inesCompliciteMorale +15, inesSilenceActif = true
```

---

## Nouveaux indices C-26 à C-43

| Ref | Label | Où | POV | Fiabilité | Prouve | Induit en erreur |
|---|---|---|---|---|---|---|
| C-26 | Email de Noé re Noé retirant Lucas du projet | Tél Lucas S02 | lucas | haute | Évincement intentionnel | Raison professionnelle légitime |
| C-27 | Pause de Lucas avant de répondre à Noé | Table 20h55 | maelys, ines | faible | Tension non dite | Cherche ses mots |
| C-28 | Yanis ignore l'éloignement Lucas/Noé | Salon S03 | yanis | faible | Éloignement post-projet | Évolution naturelle |
| C-29 | Maëlys a appelé Yanis deux fois | Salon S01 | yanis | moyenne | Besoin spécifique de sa présence | Anxiété d'hôte |
| C-30 | Vieille invitation à un autre nom | Couloir S02 | yanis | haute | Yanis est un remplaçant | Oubli |
| C-31 | Yanis placé loin du passe sans discussion | Table S04 | all | faible | Gestion de proximité | Politesse |
| C-32 | Notification push non lue de Noé à Sarah | Tél Sarah S02 | sarah | haute | Tentative de reprise | Professionnel |
| C-33 | Sarah et Noé ne se regardent pas | S02 | all | faible | Histoire passée | Se connaissent peu |
| C-34 | Maëlys informait par Inès de la relation | S03 | lucas, ines | moyenne | Mobile supplémentaire de contrôle Sarah | Commérage |
| C-35 | Inès surveille Noé entre chaque plat | S07 | lucas | faible | Surveillance protectrice | Attention fraternelle |
| C-36 | Inès reconnaît le récipient | Cuisine S06 | ines | haute | Compréhension de l'objet, silence actif | Inapercu |
| C-37 | Inès appelle Noé par surnom d'enfance | Table S08 | all | faible | Panique intérieure dissimulée | Tendresse |
| C-38 | Maëlys a dit quelque chose à Lucas sur le palier | Couloir S01b | lucas | moyenne | Elle l'a testé | Bienvenue normale |
| C-39 | Maëlys dit n'avoir aucun médicament | S03b | sarah | haute | Mensonge actif ou oubli calculé | Oubli banal |
| C-40 | L'ami remplacé avait peur de Maëlys | Terrasse S06b | lucas, yanis | haute | Comportement observé de l'extérieur | Exagération |
| C-41 | Appel direct à l'ami confirme la peur | Terrasse S06b | lucas | tres_haute | Corroboration extérieure de l'intention | Jalousie ou conflit passé |
| C-42 | Noé avoue à demi-mot à Lucas | Couloir S07b | lucas | haute | Noé sait quelque chose sur ce soir | Qu'il se couvre d'autre chose |
| C-43 | Photo du couloir après l'incident | S09b | lucas | tres_haute | Positions réelles + attitude de Maëlys | Geste de documentation normal |

---

## Impact sur la matrice de calcul existante

Tous les nouveaux deltas s'insèrent dans la matrice actuelle (`scoring_matrix.json`) **sans modifier les seuils existants**. Les nouvelles variables suivent les mêmes règles de clamp (0–100).

### Nouvelles variables à ajouter dans `scoring_matrix.json`

```json
{
  "newVariables": {
    "lucasRancuneNoe":      { "init": 55, "clampMin": 0, "clampMax": 100 },
    "yanisDoute":           { "init": 0,  "clampMin": 0, "clampMax": 100 },
    "maelysAmbivalence":    { "init": 45, "clampMin": 0, "clampMax": 100 },
    "inesAttachementNoe":   { "init": 85, "clampMin": 0, "clampMax": 100 },
    "inesCompliciteMorale": { "init": 0,  "clampMin": 0, "clampMax": 100 },
    "sarahHistoireAvecMaelys": { "init": 0, "clampMin": 0, "clampMax": 100 }
  },
  "newFlags": [
    "lucas_note_palier",
    "lucas_previent_sarah",
    "lucas_sait_medicaments",
    "lucas_contact_ami_yanis",
    "lucas_questionne_noe",
    "lucas_promet_mais_note",
    "lucas_photo_couloir",
    "maelys_teste_lucas",
    "maelys_vers_cuisine_s05b",
    "maelys_cherche_photo",
    "maelys_asu_photo",
    "yanis_doute_invitation",
    "yanis_veut_partir",
    "sarah_demande_maelys",
    "ines_silence_actif",
    "samu_appele_tot"
  ]
}
```

### Nouvelles conditions de fins

```json
// Ajout à scoring_matrix.json endingConditions

"F_SAMU_TOT": {
  "label": "SAMU appelé avant la reconstruction",
  "difficulty": 3,
  "probability_target_pct": 5,
  "requires": {
    "flags": ["samu_appele_tot"],
    "variables": { "lucasCourage": { "gte": 50 } }
  },
  "note": "Personne ne meurt. Le récit sort de la maison trop tôt pour être contrôlé."
},

"F_INES_PIVOT": {
  "label": "Inès se retourne contre Noé",
  "difficulty": 4,
  "probability_target_pct": 4,
  "requires": {
    "flags": ["ines_silence_actif"],
    "variables": {
      "inesCompliciteMorale": { "gte": 65 },
      "inesAttachementNoe": { "lte": 50 }
    }
  },
  "note": "Inès comprend que Noé était la cible et que tout s'est retombé sur elle moralement."
},

"F_YANIS_PART": {
  "label": "Yanis part avant la fin",
  "difficulty": 2,
  "probability_target_pct": 4,
  "requires": {
    "flags": ["yanis_veut_partir"],
    "variables": { "yanisDoute": { "gte": 60 } }
  },
  "note": "Yanis part avant l'incident. Il est le seul témoin externe propre. Mais il n'a rien vu."
},

"F_SARAH_SAIT": {
  "label": "Sarah comprend et se tait",
  "difficulty": 4,
  "probability_target_pct": 3,
  "requires": {
    "flags": ["sarah_demande_maelys"],
    "variables": {
      "sarahHistoireAvecMaelys": { "gte": 50 },
      "sarahStabilite": { "gte": 45 }
    }
  },
  "note": "Sarah a compris. Elle choisit de couvrir. C'est la fin la plus étrange — pas de victime physique, une victime morale volontaire."
}
```

---

## Volume total après v3

| Élément | v2 | Ajout v3 | Total v3 |
|---|---|---|---|
| Scènes | 17 | +7 inter-chapitres | **25** |
| Fins | 25 | +4 (F_SAMU_TOT, F_INES_PIVOT, F_YANIS_PART, F_SARAH_SAIT) | **29** |
| Indices | 40 | +18 (C-26 à C-43) | **58** |
| Variables d'état | 35 | +6 | **41** |
| Flags | ~20 | +16 | **~36** |
| Histoires de fond | 4 (A/B/C/D) | +4 (Lucas/Noé, Yanis invité, Noé/Sarah, Inès prot.) | **8** |
| Durée run estimée | 40–55 min | +10–15 min | **50–70 min** |
| Rejouabilité estimée | 12–18 runs | | **18–25 runs** |

---

*Généré le 2026-08-01 à partir de `data/clues.json`, `data/scenes.json`, `data/endings.json`, `data/canon_runs.json`.*
