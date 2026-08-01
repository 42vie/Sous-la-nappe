# Sous la nappe — Expansion v2 : intrigues parallèles, nouvelles fins, calcul enrichi

> Document de design daté du 2026-08-01.  
> Objectif : transformer le jeu en expérience lourde, multi-run, avec intrications narratives profondes tout en maintenant une distribution des fins équilibrée et la mécanique centrale « trouver la vérité ».

---

## 1. Philosophie d'expansion

Le moteur actuel est solide : 11 scènes, 6 POV, scoring_matrix, fins F0–F8 + D1/D2/S1.  
Le passage à une version lourde ne change pas la **structure** — il ajoute des **couches** :

1. **Intrigues parallèles** — chaque personnage a une histoire secondaire qui se déroule en arrière-plan et peut interférer avec la mécanique principale
2. **Actes supplémentaires** — 2 actes nouveaux (Acte 0 avant le dîner / Acte 3 post-hôpital) encadrent les 11 scènes actuelles
3. **Nouvelles fins** — 10 fins supplémentaires (F9–F15 + E1–E3 pour les fins d'intrigue parallèle)
4. **Système de mémoire inter-runs** — les découvertes d'une partie influencent les suivantes
5. **Formules de calcul enrichies** — pondération relationnelle, modificateurs croisés, système de dette narrative

---

## 2. Intrigues parallèles

### 2.1 — L'argent de Noé (intrigue A)

**Résumé :** Noé a détourné une somme à Maëlys trois ans avant la soirée. Ce n'est pas la seule dette — il doit aussi à Inès, qui le couvre depuis. La soirée est la date limite implicite d'un arrangement qui a expiré.

**Nouvelles variables**
```json
"noeDetteFinanciere": 100,
"inesCouverture": 80,
"maelysCreanceEmotionnelle": 90,
"yanisSaitQuelqueChose": false
```

**Révélations progressives**
- `C-A1` : virement bancaire partiel trouvé par Lucas dans un tiroir (S02)
- `C-A2` : message vocal de Noé à Inès (« T'inquiète, ce soir ça se règle ») — accessible POV Lucas S01
- `C-A3` : carnet de Maëlys — colonne de chiffres, dernière ligne barrée (S06 / étage)
- `C-A4` : Yanis a vu Noé sortir de la voiture avec une enveloppe (accessible POV Yanis S02, flag `yanisSaitQuelqueChose = true`)

**Impact sur les fins**
- Si `noeDetteFinanciere` révélée ET `inesCouverture > 70` → débloque **fin E1** (Inès co-coupable moral)
- Si `C-A4` découvert → Yanis peut trahir Noé dans la reconstruction (S11), débloque branche `yanis_trahit`

---

### 2.2 — Le passé de Sarah et Maëlys (intrigue B)

**Résumé :** Sarah et Maëlys se connaissent depuis bien avant Noé. Il y a eu une période où elles étaient proches — trop proches. Maëlys a coupé sans explication. Sarah n'a jamais vraiment compris. Ce soir, cette histoire ancienne donne à Maëlys une raison supplémentaire de garder Sarah dans la dépendance plutôt que de l'éliminer.

**Nouvelles variables**
```json
"sarahHistoireAvecMaelys": 0,
"maelysAmbivalence": 45,
"sarahTrahison": false
```

**Révélations progressives**
- `C-B1` : photo de vacances dans le couloir — Sarah et Maëlys, 6 ans plus tôt, sans Noé (S02)
- `C-B2` : SMS de Maëlys à Sarah jamais envoyé, trouvé dans les brouillons (POV Sarah, S06)
- `C-B3` : Lucas remarque que Maëlys ne regarde jamais directement Sarah — sauf une fois (S07)

**Impact sur les fins**
- Si `sarahHistoireAvecMaelys > 50` → Sarah peut choisir de couvrir Maëlys dans la reconstruction → **fin E2** (solidarité toxique)
- Si `maelysAmbivalence > 60` → Maëlys hésite au moment du service → résolution différente de `serviceHelper`

---

### 2.3 — La photo de Yanis (intrigue C)

**Résumé :** Yanis a pris une photo à 21h47. Il ne sait pas ce qu'il a capturé. La photo montre le passe, les assiettes, et dans le reflet de la vitre du cellier, le geste de Maëlys. Elle existe. Elle est sur son téléphone. Elle peut disparaître ou devenir la preuve centrale.

**Nouvelles variables**
```json
"yanisPhotoExiste": true,
"yanisPhotoDetruite": false,
"yanisPhotoVue": false,
"maelysASuPhoto": false
```

**Révélations progressives**
- `C-C1` : Yanis mentionne avoir pris des photos ce soir (accessible S09, POV Lucas)
- `C-C2` : Maëlys demande discrètement à voir le téléphone de Yanis (S10, flag `maelysASuPhoto = true`)
- `C-C3` : Si Lucas ou Sarah demande à voir les photos de la soirée avant que Maëlys n'agisse → `yanisPhotoVue = true`

**Impact sur les fins**
- Si `yanisPhotoVue = true` AND `yanisPhotoDetruite = false` → preuve irréfutable → débloque **F7** et **F9** (justice formelle)
- Si `maelysASuPhoto = true` AND photo vue → Maëlys entre en crise → débloque **D3** (panique terminale)
- Si photo détruite (Maëlys supprime) → débloque **fin E3** (preuve effacée, Yanis complice involontaire)

---

### 2.4 — Inès sait plus qu'elle ne dit (intrigue D)

**Résumé :** Inès a trouvé les boîtes dans la cuisine en arrivant. Elle n'a rien dit parce qu'elle a d'abord pensé que c'était pour Noé — et elle l'aurait laissé tomber. Quand elle comprend que la cible a peut-être changé, il est trop tard et elle se retrouve complice par silence.

**Nouvelles variables**
```json
"inesVuBoites": false,
"inesSilenceActif": false,
"inesCompliciteMorale": 0
```

**Révélations progressives**
- `C-D1` : Inès dans la cuisine S03 (POV Inès) — elle aperçoit les boîtes, range mentalement l'information
- `C-D2` : Lucas peut surprendre la réaction d'Inès face aux boîtes si les deux sont dans la cuisine en même temps (S06)
- `C-D3` : Dans la reconstruction (S11), si `inesSilenceActif = true` et `lucasLucidite > 78` → Lucas peut la confronter

**Impact sur les fins**
- Si `inesCompliciteMorale > 60` → débloque **fin E1** (variante co-culpabilité)
- Si confrontée par Lucas ET `lucasCourage > 55` → Inès craque → débloque **fin F10** (aveu partiel)

---

## 3. Nouvelles scènes

### Acte 0 — Avant le dîner (3 nouvelles scènes)

Ces scènes se jouent en **flashback**, avant l'arrivée des invités, uniquement disponible dès le second run.

```
scene_00a_preparation_cuisine
  → POV Maëlys uniquement
  → On la voit préparer l'assiette
  → Donne accès à C-A3 et confirme l'intention
  → 4 actions possibles : doser, hésiter, ranger, recommencer
  → Variables : maelysControle +/-, maelysPanic +/-

scene_00b_appel_de_noe
  → POV Maëlys ou Lucas (selon run précédent)
  → Noé appelle pour dire qu'il sera en retard
  → Maëlys raccroche. Silence. Plan de table à revoir.
  → 4 actions : sourire, noter, raccrocher sèchement, appeler Inès
  → Variables : maelysColere +, noeInfluenceMaelys -, seatingVariant peut se fixer ici

scene_00c_arrivee_ines_en_avance
  → POV Inès uniquement
  → Inès arrive 20 minutes trop tôt, se retrouve seule avec Maëlys
  → Peut trouver les boîtes, peut entendre la phrase du couloir (C-05)
  → 4 actions : explorer cuisine, rester salon, poser une question directe, ignorer
  → Variables : inesVuBoites, inesCompliciteMorale, inesTensionSociale
```

---

### Acte 3 — Post-hôpital (3 nouvelles scènes)

Disponible uniquement si `targetActual` inclut `noe` (F0, F6, F7, F8).

```
scene_12_couloir_hopital
  → POV Lucas ou Sarah
  → Couloir d'hôpital, 2h du matin
  → On attend des nouvelles de Noé
  → 4 actions : appeler Maëlys, appeler la police, rester silencieux, montrer la photo
  → Variables : lucasCourage +, sarahStabilite +/-, yanisPhotoVue peut devenir critique

scene_13_retour_de_maelys
  → POV Maëlys ou Lucas
  → Maëlys revient à la maison après le départ du SAMU
  → Elle nettoie. Elle organise le récit.
  → 4 actions : effacer, pleurer, appeler Noé, écrire dans le carnet
  → Variables : maelysControle +/-, maelysPanic, yanisPhotoDetruite possible ici

scene_14_lendemain_matin
  → POV tous sauf Maëlys
  → Le lendemain. La version officielle circule.
  → Quelqu'un va-t-il parler ?
  → 4 actions : se taire, envoyer un message, aller voir Sarah, appeler la police
  → Déclencheur final de fins F7, F9, F10, E1, E2, E3
```

---

## 4. Nouvelles fins

### Fins principales étendues

| ID | Titre | Difficulté | % cible | Déclencheur principal |
|---|---|---|---|---|
| F9 | Justice formelle | ★★★★★ | 3% | `yanisPhotoVue = true` + Lucas appelle police S12 |
| F10 | Aveu partiel d'Inès | ★★★★ | 4% | `inesCompliciteMorale > 60` + Lucas confronte S11 |
| F11 | Maëlys disparaît | ★★★★ | 3% | `maelysPanic > 80` + `maelysControle < 30` + photo détruite |
| F12 | Noé retourne l'accusation | ★★★ | 5% | `noeMensonge > 70` + Lucas ne parle pas + S14 Noé sort de l'hôpital |
| F13 | Yanis devient témoin clé | ★★★ | 5% | `yanisPhotoVue = true` + `yanisPhotoDetruite = false` + Yanis confronté S11 |
| F14 | Silence de groupe permanent | ★★ | 6% | Tous les POV passifs + socialTension < 8 + aucune confrontation |
| F15 | Maëlys recommence | ★★★★★ | 2% | Fin noire multi-run : F8 + F11 déjà vus + `maelysIntention` jamais exposée |

### Fins d'intrigues parallèles

| ID | Titre | Difficulté | % cible | Intrigue source |
|---|---|---|---|---|
| E1 | Inès co-coupable | ★★★★ | 4% | Intrigue A + D combinées |
| E2 | Solidarité toxique | ★★★★ | 3% | Intrigue B — Sarah couvre Maëlys |
| E3 | Preuve effacée | ★★★ | 5% | Intrigue C — photo détruite par Maëlys |

### Distribution totale après expansion

| Groupe | Fins | % total cible |
|---|---|---|
| Fins accessibles dès run 1 | F1, F2, F3, F4, F14 | 38% |
| Fins moyennes | F0, F5, F6, D1, D2, E3 | 26% |
| Fins dures (indices spécifiques) | F7, F8, F10, F12, F13, E1, E2 | 24% |
| Fins très rares (multi-run) | F9, F11, F15, S1 | 8% |
| Fins parallèles bonus | D3 | 4% |

---

## 5. Système de mémoire inter-runs

### Principe

Chaque run complété laisse des **fragments** dans un registre persistant Firebase. Ces fragments débloquent :
- des répliques alternatives dans les scènes communes
- des scènes supplémentaires (Acte 0 dès run 2)
- des fins impossibles en run 1 (F15 nécessite F8 + F11 vus)

### Structure Firebase proposée

```json
// Collection : sessions/{userId}/memory
{
  "runsCompleted": 3,
  "endingsSeen": ["F1", "F6", "F8"],
  "povsPlayed": ["lucas", "maelys", "sarah"],
  "fragmentsUnlocked": ["C-A1", "C-B1", "C-C1", "C-D1"],
  "act0Unlocked": true,
  "act3Unlocked": true,
  "maelysIntentionExposed": false,
  "yanisPhotoEverSeen": false,
  "globalTruthScore": 34
}
```

### globalTruthScore

Score cumulatif inter-runs (max 100) :
- +5 par fin vue nouvelle
- +3 par indice C-Ax / C-Bx / C-Cx / C-Dx découvert
- +8 si `maelysIntentionExposed` dans un run
- +10 si F7 ou F9 atteint
- Seuil 80 → débloque **fin F15** (si conditions remplies)

---

## 6. Formules de calcul enrichies

### 6.1 Modificateur relationnel croisé

Chaque action d'un personnage sur un autre modifie un score de **regard mutuel** (`mutualTrust[A][B]`). Ce score influence les probabilités de certaines fins.

```typescript
// Nouveau fichier : lib/mutualTrustEngine.ts

type MutualTrust = Record<CharacterId, Record<CharacterId, number>>

// Valeurs initiales (symétrique)
const TRUST_INIT: MutualTrust = {
  lucas:  { maelys: 40, noe: 65, ines: 50, sarah: 55, yanis: 60 },
  maelys: { lucas: 55, noe: 30, ines: 45, sarah: 60, yanis: 50 },
  noe:    { lucas: 65, maelys: 20, ines: 80, sarah: 40, yanis: 70 },
  ines:   { lucas: 50, maelys: 45, noe: 80, sarah: 25, yanis: 55 },
  sarah:  { lucas: 55, maelys: 60, noe: 40, ines: 25, yanis: 65 },
  yanis:  { lucas: 60, maelys: 50, noe: 70, ines: 55, sarah: 65 },
}

// Règle : une confrontation directe -15 sur le trust
// Une aide directe +10
// Un silence moral lors d'une humiliation -8 du côté observé
```

**Usage :** `mutualTrust[lucas][maelys] < 30` → Lucas ne sera pas cru si il accuse Maëlys devant le groupe.

---

### 6.2 Système de dette narrative (narrativeDebt)

Chaque fin vue par le joueur crée une **dette narrative** : les personnages du prochain run ont une mémoire fantôme de la fin précédente, exprimée par des micro-variations de dialogue.

```typescript
// Exemple : si F8 vu au run précédent
// → Noé dit une réplique légèrement plus défensive en S03
// → Sarah a un reflet de méfiance en S02
// Implémentation : fragments["noe_post_F8"] = true → variante de dialogue activée
```

---

### 6.3 Nouveau calcul des fins — formule v2

Actuellement les fins sont déterminées par des conditions discrètes (variables booléennes + seuils).  
Proposition : ajouter un **score d'inférence** continu par fin.

```typescript
// lib/endingScoreEngine.ts

function computeEndingAffinities(state: GameState): Record<EndingId, number> {
  return {
    F0: weight(state.targetActual === 'noe', 60)
      + weight(state.maelysControle > 65, 20)
      + weight(!state.flags.lucas_a_interrompu, 20),

    F7: weight(state.lucasLucidite > 85, 30)
      + weight(state.lucasCourage > 55, 25)
      + weight(state.clues.includes('C-19'), 15)
      + weight(state.clues.includes('C-20'), 15)
      + weight(state.clues.includes('C-22'), 15),

    F9: weight(state.yanisPhotoVue && !state.yanisPhotoDetruite, 50)
      + weight(state.lucasCourage > 60, 30)
      + weight(state.flags.lucas_appelle_police, 20),

    F15: weight(state.memory.endingsSeen.includes('F8'), 30)
      + weight(state.memory.endingsSeen.includes('F11'), 30)
      + weight(!state.memory.maelysIntentionExposed, 25)
      + weight(state.globalTruthScore >= 80, 15),
    // ... autres fins
  }
}

// La fin choisie = argmax(affinities) parmi les fins éligibles
// Si égalité → priorité à la fin de plus haute difficulté (drama)
```

---

### 6.4 Pondération POV sur les indices

Certains indices ne sont accessibles qu'à certains POV, mais leur **poids dans le score final** varie selon le POV qui joue.

```json
// Ajout dans chaque indice de clues.json
"povWeight": {
  "lucas":  1.0,
  "maelys": 0.5,
  "ines":   0.8,
  "sarah":  1.2,
  "yanis":  0.7,
  "noe":    0.3
}
```

Raisonnement : Sarah ayant tout ressenti sans comprendre la séquence, ses indices ont un poids sensoriel supérieur. Noé ayant intérêt à ne pas voir, ses indices ont un poids réduit.

---

### 6.5 Indice composite — vérité émergente

Au lieu d'une simple liste de clues, introduire un **vecteur de vérité** à 5 dimensions :

```typescript
type TruthVector = {
  intention:    number  // 0-100 : certitude que Maëlys avait un plan
  target:       number  // 0-100 : certitude sur la cible prévue (Noé)
  mechanism:    number  // 0-100 : certitude sur le vecteur (sauce, passe)
  witness:      number  // 0-100 : certitude sur le silence de Lucas
  narrative:    number  // 0-100 : certitude sur la fausseté du récit collectif
}

// Fin F7 nécessite : tous les vecteurs > 60
// Fin F9 nécessite : intention > 70 + mechanism > 80 + preuve physique (photo)
// Fin F4 accessible si : intention < 30 (joueur n'a pas compris, Maëlys auto-contaminée reste inexpliquée)
```

---

## 7. Nouvelles variables d'état à ajouter

```json
// Ajout à characters.json initialVars et canon_runs.json characterState

// Maëlys
"maelysAmbivalence": 45,
"maelysCreanceEmotionnelle": 90,
"maelysASuPhoto": false,

// Noé
"noeDetteFinanciere": 100,
"noeHopital": false,

// Inès
"inesVuBoites": false,
"inesSilenceActif": false,
"inesCompliciteMorale": 0,
"inesCouverture": 80,

// Sarah
"sarahHistoireAvecMaelys": 0,
"sarahTrahison": false,

// Yanis
"yanisPhotoExiste": true,
"yanisPhotoDetruite": false,
"yanisPhotoVue": false,

// Global
"globalTruthVector": { "intention": 0, "target": 0, "mechanism": 0, "witness": 0, "narrative": 0 }
```

---

## 8. Ordre d'implémentation recommandé

```
Phase 1 — Fondations (sans toucher aux scènes existantes)
  □ Ajouter mutualTrustEngine.ts
  □ Ajouter endingScoreEngine.ts (formule v2)
  □ Ajouter les nouvelles variables dans characterState
  □ Mettre à jour scoring_matrix.json avec F9–F15 + E1–E3
  □ Mettre à jour Firebase schema (sessions memory)

Phase 2 — Intrigues parallèles
  □ Ajouter indices C-A1 à C-D3 dans clues.json
  □ Ajouter les nouvelles conditions dans scenes.json (choices existants)
  □ Ajouter les flags yanisPhotoVue, inesVuBoites, etc.

Phase 3 — Nouvelles scènes
  □ Coder scene_00a / 00b / 00c (Acte 0 — flashback)
  □ Coder scene_12 / 13 / 14 (Acte 3 — post-hôpital)
  □ Brancher les actes sur le système de mémoire inter-runs

Phase 4 — Nouvelles fins
  □ Implémenter F9–F15 + E1–E3 dans endingCalculator.ts
  □ Rédiger les playerMessage et descriptions pour chaque fin
  □ Créer les écrans de fin spécifiques (visuels Acte 3)

Phase 5 — Mémoire inter-runs
  □ Créer la collection Firebase sessions/{userId}/memory
  □ Brancher globalTruthScore
  □ Implémenter les variantes de dialogue narrativeDebt
  □ Débloquer Acte 0 conditionnel
```

---

## 9. Volume final attendu

| Élément | Actuel | Après v2 |
|---|---|---|
| Scènes | 11 | **17** (+ Acte 0 × 3 + Acte 3 × 3) |
| Fins | 12 (F0–F8 + D1/D2/S1) | **25** |
| Variables d'état | 21 | **35** |
| Indices (clues) | 25 | **40** (+15 intrigues parallèles) |
| POV jouables | 6 | 6 (inchangé) |
| Actions par personnage/scène | 1–2 | **4 distinctes** (déjà amorcé) |
| Durée run moyen estimé | 25 min | **40–55 min** |
| Rejouabilité estimée | 4–6 runs | **12–18 runs** |

---

*Généré le 2026-08-01 à partir de `data/endings.json`, `data/canon_runs.json`, `data/scoring_matrix.json`.*
