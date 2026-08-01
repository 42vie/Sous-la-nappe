# Sous la nappe — Bible narrative étendue
**Document de travail — 2026-08-01**

> Objectif : conserver l'idée de base, renforcer la backstory, augmenter la tension dramatique, multiplier les variantes de fins, et redéfinir une vraie fin canonique où **Noé tombe gravement malade et part à l'hôpital — il survit**.

---

## 1. Nouvelle proposition canonique

La fin canonique devient **F0** : Noé mange l'assiette visée, fait une détresse sévère, part à l'hôpital, survit. Sa survie ouvre une vérité plus sale que sa mort : tout le monde doit vivre avec ce qu'il sait, ce qu'il soupçonne, et ce qu'il choisit de ne pas dire.

Sarah reste victime structurelle dans la majorité des branches : même quand elle ne tombe pas physiquement le plus bas, elle paie toujours narrativement. L'invariant émotionnel est préservé.

---

## 2. Explication finale unifiée

Maëlys n'a **jamais voulu tuer**. Elle a voulu rendre Noé très malade — assez pour le contraindre à une vérité publique, assez pour lui faire perdre sa superbe, assez pour reprendre un ascendant moral après la trahison sur la maison, l'argent, l'abandon.

Elle a sous-estimé trois choses : les déplacements de table, la logistique du service, et l'épaisseur réelle du passif émotionnel du groupe.

Le sens de la fin n'est pas "qui a empoisonné ?" mais **"qui a laissé la mécanique aller jusqu'au bout ?"**

La faute se distribue :
- Maëlys prépare
- Noé déclenche l'histoire sur des mois
- Lucas comprend et tarde
- Inès aggrave la pression sociale
- Yanis déplace les corps sans saisir les conséquences
- Sarah occupe l'angle mort où la catastrophe devient crédible

---

## 3. Backstory approfondie

### Maëlys Renaud
Maëlys a co-construit la maison avec Noé pendant cinq ans sans jamais en devenir la propriétaire officielle. Elle a avancé de l'argent, assuré les travaux, tenu les repas, tenu les saisons, tenu les apparences. Le jour où elle découvre que la maison a été sécurisée juridiquement sans elle, elle comprend que son rôle dans la relation était structurel mais non reconnu.

Son drame intime : elle ne supporte pas tant la trahison économique que la **relecture rétrospective de toute sa vie commune**. Elle se demande si Noé l'a aimée ou s'il a simplement aimé être porté.

Son besoin de maîtrise culmine dans l'idée d'un repas parfaitement scénographié où, pour une fois, elle choisit l'effet au lieu de le subir.

### Noé Varnier
Noé a toujours préféré les vérités fractionnées aux aveux entiers. Il a menti par morceaux, avec assez de sincérité locale pour rester défendable. Dettes masquées, messages supprimés, promesses retardées. Ce n'est pas un monstre frontal — c'est pire : quelqu'un qui sait rendre son irresponsabilité socialement plausible.

Sa grande peur n'est pas de mourir : **c'est d'être vu comme petit, opportuniste, médiocre**. L'hospitalisation finale le brise parce qu'elle le dégonfle symboliquement devant tout le monde.

Backstory à ancrer : une pression financière ancienne, des dettes cachées, et une relation dissimulée avec Sarah (messages supprimés, C-23).

### Inès Varnier
Inès a grandi en corrigeant les récits familiaux. Elle est devenue la gardienne glacée des faits. Elle protège Noé parce qu'elle sait à quel point il est faible, et parce qu'admettre ses fautes reviendrait à reconnaître la fragilité de tout le système Varnier.

Sa tragédie : elle pense être du côté du réel alors qu'elle ne fait souvent que consolider la version la plus soutenable pour sa famille. Dans certaines branches, elle devient deuxième victime physique ; dans d'autres, le cerveau du récit de sortie.

### Lucas Berthier
Lucas est celui qui sait le plus tôt, mais toujours trop peu pour parler sans risque. Il voit le reflet (C-11), il possède le vocal (C-20), il lit les dynamiques. Il n'agit pas parce que toute sa vie émotionnelle repose sur un compromis : **être juste sans se salir, présent sans s'exposer, lucide sans devenir responsable**.

Backstory proposée : un ancien événement où il n'a pas parlé à temps. La soirée réactive cette ancienne défaillance. Sa vraie trajectoire : comprendre qu'observer est parfois une forme active de violence.

### Sarah Kessler
Sarah connaît le groupe par les marges sensibles : voix de nuit, retours d'après-dispute, odeurs de cuisine, silences qui suivent les départs. Sa mémoire est sensorielle — juste sur la matière, fragile sur l'ordre. Cela la rend essentielle et inaudible à la fois.

Backstory proposée : Maëlys l'a un jour recueillie dans une phase critique. Cette dette affective explique sa loyauté aveugle et, cette nuit-là, son absence totale de méfiance. **Plus elle veut aider, plus elle se met en danger.**

### Yanis Amrani
Yanis est entré tard dans le groupe et compense son extériorité par l'énergie. Il anime, photographie, sert, relance. Il croit que l'ambiance se gère comme une matière légère — mais il manipule en réalité les vecteurs de la tragédie : placements, rythmes, objets déplacés.

Backstory : solitude sociale profonde masquée par l'humour. Il tient à ce groupe parce qu'il a peur d'en être exclu. C'est pour ça qu'il insiste pour que tout se passe bien, même quand tout indique l'inverse.

---

## 4. Architecture des fins

| ID | Titre | Résumé | Déclencheur principal |
|---|---|---|---|
| **F0** | Noé à l'hôpital | Fin canonique. Noé reçoit l'assiette, survit. | targetActual = noe |
| **F1** | Sarah touchée | swapB + Sarah service. Récit falsifié dominant. | targetActual = sarah (base) |
| **F2** | Inès touchée | Placement décalé, Inès à la mauvaise position. | targetActual = ines |
| **F3** | Double contamination | seatingVariant = chaos. Sarah + Inès. | targetActual = [sarah, ines] |
| **F4** | Maëlys auto-contaminée | L'assiette revient sur elle via replacements. | targetActual = maelys |
| **F5** | Lucas parle trop tôt | Personne ne meurt. Groupe fracturé, pas de preuve. | lucasCourage >= 75 + reflet vu |
| **F6** | Noé survit, Sarah détruite | Noé hospitalisé puis impose un récit contre Sarah. | noeMensonge >= 80 + lucasCourage < 40 |
| **F7** | Vérité complète post-hôpital | C-19 + C-20 + C-22 assemblés. Enquête. | targetActual = noe + clues révélés |
| **F8** | Fin noire | Noé et Maëlys co-construisent le silence. | noeMensonge >= 80 + false_sarah |

---

## 5. Scènes finales proposées

### Finale A — Couloir vide
La maison est silencieuse après le départ de l'ambulance. La photo du couloir devient le dernier objet fixe. Version idéale pour les fins de silence collectif (F1, F8).

### Finale B — Parking des urgences
Noé vomit, nie, accuse, puis s'effondre émotionnellement quand il comprend que Maëlys n'a pas improvisé. Fin canonique recommandée (F0, F7).

### Finale C — Cuisine retournée
Lucas et Maëlys se retrouvent seuls devant les assiettes sales. Confrontation intime, froide, presque sans cris. (F4, F5)

### Finale D — Message vocal
Le vocal ancien (C-20) est enfin rejoué au bon moment. Il ne prouve pas tout, mais détruit le récit confortable. (F5, F7)

### Finale E — Photo 21h47
La photo de Yanis (C-19) révèle un reflet, une place, une main. Indice visuel de reconstruction. (F7, Yanis post-scène)

### Finale F — Retour de Sarah
Sarah, revenue de l'hôpital ou du couloir, dit une phrase sensorielle minuscule qui reconfigure toute la soirée. (F0, F7)

---

## 6. Scène post-fin Yanis

**Titre :** La photo envoyée
**Condition :** yanisDuoShift = false + C-19 révélé + survivingNarrative = false_sarah_* + yanis_a_photo = true

> Trois semaines après la soirée. Yanis est dans son appartement. Il regarde la photo sur son téléphone — la table, les assiettes, la ligne du passe. Il sait ce qu'il voit maintenant. Il appuie sur envoyer.

- **Choix A — Envoyer** → déverrouille F7 depuis n'importe quelle branche F1/F8
- **Choix B — Annuler** → confirme F6 ou F8 ; Yanis disparaît du groupe définitivement

> En branche F3 (seatingVariant = chaos + socialTension >= 90), une contamination accidentelle de Yanis peut être ajoutée.

---

## 7. Structure de chapitre — 4 actions distinctes par personnage

Chaque chapitre propose 4 actions typées différentes. Aucun personnage ne peut avoir la même action qu'un autre dans la même scène.

Verbes-types par chapitre :

| Ch. | Verbes-types |
|---|---|
| 1 | se souvenir, nier, sonder, archiver |
| 2 | observer, se présenter, fouiller, désamorcer |
| 3 | provoquer, écouter, protéger, tester |
| 4 | s'asseoir, déplacer, imposer, céder |
| 5 | jouer, truquer, interrompre, se retirer |
| 6 | surprendre, espionner, effacer, sortir |
| 7 | humilier, défendre, dévier, photographier |
| 8 | servir, prendre, renverser, bloquer |
| 9 | secourir, observer, accuser, dissimuler |
| 10 | raconter, contester, assembler, falsifier |
| 11 | partir, confronter, détruire, confesser |

---

## 8. Prochains livrables conseillés

1. Réécriture de `data/canon_runs.json` — targetPlanned = noe fixé, targetActual = noe en canon
2. Réécriture de `data/endings.json` — ajouter F0, F6, F7, F8
3. Compléter `data/scenes.json` — 4 actions distinctes par personnage par scène
4. Ajouter `data/scenes_postfin.json` — scène Yanis + 6 finales modulaires
5. Brancher les résumés finaux dynamiques à partir de la logique du README_CONTEXTE_MATRICES
