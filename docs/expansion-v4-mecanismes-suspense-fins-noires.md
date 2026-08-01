# Sous la nappe — Expansion v4 : mécanismes de suspense, fins noires, histoire Sarah/Noé

> Document daté 2026-08-01. Complément direct de v2 et v3.  
> Sources lues : `scenes.json` (S01–S11 complet), `endings.json`, `clues.json`, `canon_runs.json`.  
> Trois volets : (A) mécanismes de jeu nouveaux pour le suspense, (B) histoire croisée Sarah/Noé avec mort possible, (C) nouvelles fins noires.

---

## Volet A — Mécanismes de suspense

### A1. Le compte à rebours invisible

**Problème actuel :** le joueur ne ressent pas l’urgence. L’incident arrive à S09 quelle que soit la vitesse de jeu.

**Proposition :** introduire un `tensionClock` interne, incrémenté à chaque action passive (pass) et décrémenté par les actions de lucidité ou de courage. Si `tensionClock >= 80` avant S08, un **événement d'alerte** s'insère automatiquement.

```typescript
// lib/tensionClock.ts

const TENSION_THRESHOLDS = {
  warning: 50,   // UI : une bougie s'éteint sur la table (visuel)
  critical: 70,  // UI : la musique change, le texte se compresse
  trigger: 80,   // Event : insertion automatique de la scène S07b
                 //         ou accélération du service (S08 raccourci)
}

// Action passive +3 à tensionClock
// Action "observe" (neutre) +1
// Action courage / intervention -4
// lucasLucidite > 80 → tick réduit de moitié
```

**Effets visuels recommandés :**
- Entre 0 et 50 : interface neutre
- Entre 50 et 70 : une bougie du fond de la table s’éteint, la typographie légèrement plus serrée
- Au-dessus de 70 : texte plus court par choix, temps de lecture réduit, couleur #8b1a1a en halo
- Au-dessus de 80 : message d’alerte unique, non intrusif (« Le dîner approche de son terme »)

---

### A2. Le système de révélation différée

**Problème actuel :** les indices s’affichent immédiatement quand ils sont déclenchés. Pas de suspense dans la découverte.

**Proposition :** les indices `reliability: faible` et `reliability: moyenne` sont révélés en **trois couches** avec un texte partiel d’abord.

```json
// Structure étendue d'un indice dans clues.json
{
  "ref": "C-11",
  "label": "Reflet dans la vitre du cellier",
  "revealLayers": [
    {
      "layer": 1,
      "text": "Dans le reflet, tu vois Maëlys penchée sur quelque chose.",
      "unlocksAt": "firstSeen"
    },
    {
      "layer": 2,
      "text": "Un geste. Une main. Une assiette en particulier.",
      "unlocksAt": "lucasLucidite_gte_70"
    },
    {
      "layer": 3,
      "text": "Geste dirigé vers une assiette unique. Pas une sauce. Un ciblage.",
      "unlocksAt": "clues_C-10_seen"
    }
  ]
}
```

**Effet :** le joueur se souvient d'avoir vu quelque chose, mais ne comprend pas tout de suite ce qu'il a vu. Le retour sur un indice déjà collecté peut révéler une couche supplémentaire si les conditions sont remplies.

---

### A3. Le mode « silence actif »

**Proposition :** certains moments de la soirée s’arrêtent. Aucune action disponible. Le joueur est forcé à lire.

Ces moments durent 8 à 12 secondes et se déclenchent quand :
- `socialTension >= 20` ET `lucas_temoin_morpion = true`
- Ou juste avant S08 si `tensionClock >= 60`

```typescript
// Exemple de texte pour silence actif avant S08 :
// « La table est silencieuse.
//   Tu connais ce silence.
//   C’est le silence des situations où quelqu’un devrait parler
//   et où personne ne le fait.
//   Tu ne le feras pas non plus. »
// → puis S08 commence.
```

---

### A4. Le journal de Lucas (mémoire visible)

**Proposition :** Lucas dispose d’un "journal" interne accessible à tout moment pendant une partie. Ce journal liste, dans l’ordre, ce que Lucas a énoté mentalement depuis le début de la soirée. Ce ne sont pas les indices bruts — ce sont des phrases en voix intérieure, courtes, subjectives.

```typescript
// Exemples d'entrées
[
  "Elle a corrigé la place de Noé comme si ça comptait vraiment.",
  "Le reflet. Elle penchée. Une seule assiette.",
  "Sarah a dit qu’elle avait oublié ses comprimés. Je n’ai rien dit.",
  "Noé m’a demandé de ne rien répéter. J’ai acquiescé.",
  "Le service. L’ordre. Sarah place 4.",
  "J’avais tout pour éviter ça."
]
```

Le joueur peut à tout moment consulter ce journal. Chaque entrée est un clin d’œil narratif, pas un indice fonctionnel. Mais si le joueur consulte le journal à S11, la dernière entrée se révèle «mémo oubliée» et débloque C-38.

---

### A5. Le « moment du doute » de Maëlys

**Proposition :** en S08, avant le service, un événement aléatoire pondéré peut déclencher une **hésitation de Maëlys**. Si `maelysAmbivalence >= 60`, une option supplémentaire apparaît dans son espace d'action :

```
Option secrète (POV Maëlys uniquement) :
« Tout arrêter. Rentrer l’assiette. Prétexter un problème de cuisson. »
→ maelysAmbivalence +20, maelysPanic +15, maelysControle -10
→ targetActual recalculé → aucune victime
→ Débloque la branche : « Maëlys renonce » et fin F14 (silence permanent)
```

Cette option n’apparaît jamais si `maelysColere >= 80` — la colère tue l’ambivalence.

---

### A6. Le système d’écoute clandestine

**Proposition :** certains personnages peuvent **écouter une conversation** à laquelle ils ne participent pas, si leur POV et leur position le permettent.

```json
// Ajout dans scenes.json — propriété "eavesdropOpportunities"
"eavesdropOpportunities": [
  {
    "id": "eavesdrop_s06_noe_terrasse",
    "scene": "scene_06_kitchen_aside",
    "listenablePov": ["lucas", "ines"],
    "targetPov": "noe",
    "condition": "noe_est_sur_terrasse",
    "revealsClue": "C-23",
    "text": "Noé parle bas au téléphone. Tu entends 'supprimé' et 'elle ne saura pas'."
  },
  {
    "id": "eavesdrop_s09b_couloir",
    "scene": "scene_09b_couloir_incident",
    "listenablePov": ["yanis"],
    "targetPov": ["lucas", "maelys"],
    "condition": "lucas_questionne_maelys",
    "revealsClue": "C-43",
    "text": "Maëlys dit, très bas : 'Ce n’était pas prévu comme ça.' Elle ne précise pas ce qui était prévu."
  }
]
```

---

### A7. Le mini-jeu de reconstruction inversée (S11 enrichi)

**Problème actuel :** S11 est passif — la reconstruction du récit se fait par des choix binaires (parler / ne pas parler).

**Proposition :** introduire un mini-jeu de **reconstruction inversée** où le joueur doit ordonner 5 événements dans l’ordre chronologique réel, en utilisant les indices collectés.

```
Mini-jeu : « La ligne du temps »
→ 5 événements mélangés (un décor, une action, une heure)
→ Le joueur les remet dans l’ordre
→ Si ordre correct + indices suffisants → le "score de vérité" dépasse le seuil requis
→ Si ordre incorrect ou indices manquants → le récit de Noéë "gagne", fin F1 ou F6

Seuil de réussite :
  truthVector.mechanism >= 60
  AND truthVector.intention >= 50
  AND clues.length >= 6
```

---

## Volet B — Histoire croisée Sarah/Noé : « Couvrir ou mourir »

> C’est l’histoire la plus sombre du jeu. Elle peut mener à la mort de Sarah ou au silence définitif de Noé — selon les choix du joueur.

### B1. Contexte narratif — ce qui existait avant la soirée

Noéë et Sarah ont eu une relation courte, voilà trois ans. Sarah y a mis fin après avoir compris que Noé lui avait menti sur sa situation avec Maëlys — il vivait encore avec elle tout en disant le contraire. Sarah est partie sans faire de scène. Noé a réinterprété la rupture : dans sa version, c’est lui qui est parti.

Depuis, Noé a essayé de renouer à deux reprises. Sarah a refusé. Il y a trois semaines, il lui a envoyé un message « pour qu’on soit en paix ». Elle n’a pas répondu.

Ce soir, Noé sait deux choses que Sarah ignore :
1. Maëlys a préparé quelque chose pour lui (il a entendu un fragment de conversation téléphonique)
2. Sarah est fragile ce soir — sans traitement, avec de l’alcool

Il a choisi de venir quand même. Parce qu’il pensait pouvoir contrôler. Parce qu’il voulait se prouver que tout était éteint entre eux.

**Nouvelle variable :**
```json
"noeSaitFragmentMaelys": true,
"noeSaitFragiliteSarah": true,
"noeRaisonsDeVenir": "prouver_extinction"
```

---

### B2. Bifurcation 1 — Noé intervient (et Sarah survít mais sait)

**Déclencheur :** Si en S07b, Noé choisit « avouer à demi-mot » (option d) → `C-42` révélé → Lucas apprend que Noé savait.

En S08, si Lucas confronte Noé avec ce qu’il sait :
```
Option contextuelle (POV Lucas, requiresClue: C-42) :
« Lui dire qu’il savait. Et qu’il n’a rien fait. »
→ noeLachete -15, noeCruaute +12, lucasCourage +10
→ Noé peut alors choisir d’interrompre le service
→ targetActual = noe (il prend l’assiette lui-même)
→ Fin F0 activée : Noé reçoit l’assiette, part à l’hôpital
```

Mais la complication : **Sarah assiste à cette confrontation**. Elle comprend que Noé savait qu’elle était en danger. Il ne l’a pas protégée. Il l’a laissée servir.

Après S09, si `sarahHistoireAvecNoe` (renommé depuis C-32 et C-33) est active ET `sarahMemoire >= 55` :
```
S10 — Option nouvelle (POV Sarah) :
« Regarder Noé dans les yeux. Lui dire qu’elle sait qu’il savait. »
→ sarahStabilite +10, sarahDependanceMaelys -20
→ noeMensonge +15, noeLachete +8
→ Flag : [sarah_sait_que_noe_savait]
→ Débloque : branche « Sarah se retourne contre Noé » → fin F_SARAH_RETOURNE
```

---

### B3. Bifurcation 2 — Noé se tait et Sarah meurt

**Contexte :** Cette fin n’est disponible que si :
- `noeSaitFragmentMaelys = true` (canonique)
- `noeSaitFragiliteSarah = true` (canonique)
- Noé n’est jamais intervenu dans aucune des scènes (toutes les actions `pass`)
- `sarahStabilite <= 20` en S09 (aggravation par alcool sans traitement)

**Description :**
Sarah s’écroule. Cette fois, la réaction médicale est trop sevère. Elle décède à l’hôpital, la nuit même. Noé savait. Il n’a rien fait. Il n’a aucune responsabilité juridique. Il a une responsabilité totale.

**Conditions combinées pour activer cette fin :**
```json
"F_SARAH_MORT": {
  "title": "Sarah ne revient pas",
  "difficulty": 5,
  "probability_target_pct": 2,
  "requires": {
    "variables": {
      "sarahStabilite": { "lte": 20 },
      "sarahMedication": { "eq": "forgotten" },
      "noeSaitFragiliteSarah": { "eq": true },
      "noeLachete": { "gte": 75 }
    },
    "flags": {
      "lucas_a_interrompu_service": false,
      "samu_appele_tot": false
    }
  },
  "description": "Noé savait. Il a choisi de ne rien faire à chaque bifurcation. Il vit avec ça.",
  "playerMessage": "Il n’y avait pas de meurtre prémédité contre Sarah. Juste quelqu’un qui savait et qui a regardé ailleurs. Ce n’est pas moins grave.",
  "epilogue": "Maëlys n’a jamais visé Sarah. Noé ne l’a pas empoisonnée. Mais dans la liste de ceux qui auraient pu l’empêcher, son nom est le premier."
}
```

---

### B4. Bifurcation 3 — Noé tue le secret (et Sarah vit, silencieuse)

**Contexte :** Noé sort de l’hôpital. Sarah est en vie. En S14 (Acte 3), Noé vient la voir seul.

Il ne s’excuse pas. Il dit qu’il était « perdu ce soir-là ». Il lui demande de ne « rien compliquer ». Sarah a le choix.

```
POV Sarah — S14 :
  a) Se taire            → fin F_SARAH_SAIT_ET_COUVRE
  b) Appeler Lucas       → flag [sarah_appelle_lucas], débloque F_SARAH_RETOURNE
  c) Lui dire d'partir   → fin F_RUPTURE_FINALE
  d) Lui montrer C-32    → (la notif push qu’il lui a envoyée) → Noé quitte la pièce, ne revient pas
                            fin F_NOE_DISPARAIT
```

**Fin F_NOE_DISPARAIT :**
```json
{
  "title": "Noé disparait",
  "difficulty": 4,
  "probability_target_pct": 3,
  "description": "Noé ne repart pas à l’hôpital. Il ne rappelle pas. Il change de numéro trois semaines plus tard.",
  "playerMessage": "Personne n’a menti. Personne n’a vraiment dit la vérité. Sarah a montré une preuve que personne n’était prêt à regarder."
}
```

---

### B5. Bifurcation 4 — Noé est l’empoisonneur (fin alternative extrême)

> **Fin secrète — multi-run uniquement. Nécessite F8 vu au run précédent.**

**Contexte :**
Après avoir vu la fin F8 (Noé détruit Sarah publiquement), le joueur commence un nouveau run. Au run 2+, des fragments apparaîssent qui n’étaient pas lisibles au run 1.

Parmi eux : un fragment cautioné d’un message de Noé à quelqu’un (**C-44, uniquement multi-run**) qui suggère qu’il savait non seulement la fragilité de Sarah ce soir-là, mais qu’il avait lui-même ajouté quelque chose dans le verre de Sarah — indépendamment de l’assiette de Maëlys.

Deux empoisonneurs. Deux intentions différentes. Une seule victime.

**Nouvelle variable multi-run :**
```json
"noePoisonVerre": false,
"C-44": {
  "ref": "C-44",
  "label": "Fragment de message de Noé — lisible uniquement run 2+",
  "where": "Téléphone Noé, S07b option d",
  "access": ["lucas"],
  "reliability": "tres_haute",
  "multiRunOnly": true,
  "proves": "Noé a ajouté quelque chose dans le verre de Sarah indépendamment de Maëlys",
  "misleads": "Cela ne change pas la causalité médicale de la soirée"
}
```

**Fin F_NOE_EMPOISONNEUR :**
```json
{
  "title": "Deux dispositifs, une victime",
  "difficulty": 5,
  "probability_target_pct": 1,
  "multiRunOnly": true,
  "requires": {
    "memory": { "endingsSeen": ["F8"] },
    "clues": ["C-44"],
    "variables": { "noeLachete": { "gte": 70 }, "noeMensonge": { "gte": 75 } }
  },
  "description": "Maëlys avait visé Noé. Noé avait visé Sarah. Aucun des deux ne savait que l’autre avait préparé quelque chose. La soirée était minée deux fois.",
  "playerMessage": "La vraie fin n’est pas qui a empoisonné. C’est qu’il y avait deux empoisonneurs dans la même pièce qui ne savaient pas que l’autre était là.",
  "epilogue": "Sarah est en vie. Elle ne saura jamais que les deux personnes à qui elle faisait le plus confiance ce soir avaient toutes les deux préparé quelque chose pour elle."
}
```

---

## Volet C — Nouvelles fins noires complètes

### Tableau synthétique des fins noires v4

| ID | Titre | Mort | Responsable | Difficulté | % cible |
|---|---|---|---|---|---|
| F_SARAH_MORT | Sarah ne revient pas | Sarah | Noé (inaction) | ★★★★★ | 2% |
| F_NOE_DISPARAIT | Noé disparait | Non | Sarah (révèle C-32) | ★★★★ | 3% |
| F_SARAH_RETOURNE | Sarah se retourne contre Noé | Non | Sarah (parle) | ★★★★ | 3% |
| F_SARAH_SAIT_ET_COUVRE | Sarah sait et se tait | Non | Sarah (choisit) | ★★★ | 4% |
| F_RUPTURE_FINALE | Sarah dit à Noé de partir | Non | Sarah (force) | ★★★ | 4% |
| F_NOE_EMPOISONNEUR | Deux dispositifs, une victime | Non | Maëlys + Noé | ★★★★★ | 1% |

---

### Description complète — F_SARAH_MORT

**Titre :** Sarah ne revient pas  
**Sous-titre :** *Ce n’est pas un meurtre. C’est une succession de silences.*

**Scène finale :**  
Le couloir d’hôpital. Lucas est assis. Inès est dehors, au téléphone avec personne. Noé n’est pas venu. Maëlys est rentrée chez elle. Un médecin sort d’une porte et parle à voix basse. Lucas ferme les yeux.

**Écran final :**  
> « Ce soir, aucune des décisions qui ont méné à ça n’a été irréversible, prise seule.  
> C’est leur accumulation qui l’est devenue. »

**Liste des silences :**  
- Noé a su qu’elle était fragile. Il n’a pas dit.  
- Lucas a vu l’assiette. Il n’a pas dit.  
- Maëlys a préparé quelque chose. Elle s’est dit que ça ne toucherait pas Sarah.  
- Sarah avait oublié son traitement. Elle s’est dit que ce n’était pas grave pour un soir.  

---

### Description complète — F_NOE_EMPOISONNEUR

**Titre :** Deux dispositifs, une victime  
**Sous-titre :** *La soirée était minée deux fois sans que personne le sache.*

**Scène finale (multi-run) :**  
Lucas est dans sa voiture, après l’hôpital. Il a le fragment C-44 sur son téléphone. Il a le vocal de Maëlys. Il a la photo de Yanis. Il a tout. Il pose le téléphone sur le siège passager. Il regarde par le pare-brise. Il ne sait pas ce qu’on fait avec ça.

**Écran final :**  
> « Deux personnes avaient préparé quelque chose ce soir.  
> Elles ne savaient pas que l’autre était là.  
> Elles se sont retrouvées dans la même maison, autour de la même table,  
> avec la même idée.  
> La seule chose plus effrayante que Maëlys ce soir,  
> c’est que Noé était là aussi. »

---

## Volet D — Récapitulatif de toutes les fins (v4 cumulé)

| Groupe | IDs | % total |
|---|---|---|
| Fins run 1 accessibles | F1, F2, F3, F4, F14 | 38% |
| Fins moyennes | F0, F5, F6, D1, D2, E3 | 21% |
| Fins dures | F7, F8, F10, F12, F13, E1, E2 | 17% |
| Fins Sarah/Noé (v4) | F_SARAH_SAIT_ET_COUVRE, F_RUPTURE_FINALE, F_SARAH_RETOURNE, F_NOE_DISPARAIT | 14% |
| Fins très rares | F9, F11, F15, F_SAMU_TOT, F_INES_PIVOT, F_YANIS_PART, S1 | 7% |
| Fins noires absolues (multi-run ou conditions extrêmes) | F_SARAH_MORT, F_NOE_EMPOISONNEUR, D3 | 3% |

**Total : 29 fins + 6 nouvelles v4 = 35 fins.**

---

## Récapitulatif mécanismes ajoutés (Volet A)

| Mécanisme | Fichier cible | Impact |
|---|---|---|
| `tensionClock` | lib/tensionClock.ts | Urgence ressentie, UI réactive |
| Révélation en couches | clues.json (revealLayers) | Suspense dans la découverte |
| Silence actif | scenes.json (silentMoments) | Rupture de rythme dramatique |
| Journal de Lucas | lib/lucasJournal.ts | Mémoire narrative jouable |
| Moment du doute Maëlys | scenes.json S08 | Fin alternative pacifique accessible |
| Écoute clandestine | scenes.json eavesdropOpportunities | Indices contextuels croisés |
| Mini-jeu ligne du temps | lib/timelineGame.ts | Reconstruction active en S11 |

---

*Généré le 2026-08-01 à partir de `data/scenes.json` (S01–S11 intégral), `data/endings.json`, `data/clues.json`, `data/canon_runs.json`.*
