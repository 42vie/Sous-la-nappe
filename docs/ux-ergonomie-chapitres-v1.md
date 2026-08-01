# Ergonomie des chapitres — Recommandations v1

> Daté 2026-08-01. Complément direct du système `onboarding.json`.  
> Ce document traduit les `chapterUXGuidelines` en décisions de composants concrètes.

---

## Problème actuel

L'interface des chapitres affiche simultanément :
- Le bloc narratif (texte POV)
- Les 4–8 choix disponibles
- La barre de tension sociale (valeur numérique visible)
- Le bouton carnet
- L'indicateur de chapitre avec numéro exact et total
- Le plan de table en barre latérale

Résultat : surcharge cognitive, perte d'immersion, le joueur lit les métadonnées avant le texte.

---

## Architecture recommandée par zone d'écran

```
┌─────────────────────────────────────┐
│  [Titre scène]          [●●○] signal│  ← zone haute : titre + tension signal (3 états)
├─────────────────────────────────────┤
│                                     │
│   BLOC NARRATIF POV                 │  ← 60% écran, texte seul, fond sombre
│   (texte, 3–5 lignes max visibles)  │
│   → swipe up pour lire la suite     │
│                                     │
├─────────────────────────────────────┤
│  [Choix A]  [Choix B]               │  ← zone basse : 2 à 4 choix max
│  [Choix C]  [Choix D]               │     boutons larges, touch-friendly
│                                     │
│  ────────────────────  [📓] [🪑]    │  ← icônes discrètes : carnet + plan table
└─────────────────────────────────────┘
```

---

## Règles de filtrage des choix

Le JSON `scenes.json` contient jusqu'à 8+ choix par POV. Ne jamais tous les afficher.

**Priorité d'affichage (ordre décroissant) :**
1. Choix avec `requiresFlag` actif → toujours afficher en premier
2. Choix avec `revealsClue` → priorité haute
3. Choix avec `effect socialTension delta >= 5` → priorité narrative
4. Choix `examine_object` (touch) → toujours proposer 1 seul en dernier
5. Choix `stay_silent / let_pass` → 1 seul visible, le moins dramatique

**Maximum absolu : 4 choix affichés simultanément.**  
Si le moteur calcule plus de 4 disponibles → les classer par priorité, afficher les 4 premiers.

---

## Tension sociale — Signal visuel

| Valeur interne | État affiché | Visuel suggéré |
|---|---|---|
| 0–30 | Calme | Bougie allumée, flamme stable |
| 31–65 | Tendu | Bougie vacillante, halo orange |
| 66–100 | Critique | Bougie presque éteinte, halo rouge, légère vibration |

Jamais de chiffre visible. Jamais de barre de progression chiffrée.

---

## Carnet — Comportement overlay

```
onNotebookOpen():
  → blur(gameScreen, intensity: 40%)
  → slideUp(notebookPanel, from: bottom)
  → display: pages scrollables horizontalement
  → chaque page = 1 indice ou 1 entrée journal
  → nouvelles pages : badge rouge sur l'icône (max 3 non lus)

onNotebookClose():
  → swipe down OU tap en dehors
  → unblur(gameScreen)
  → game reprend exactement là où elle était
```

Le carnet ne suspend pas la partie. Il ne cache pas les choix.

---

## Plan de table — Interaction

```
onSeatingOpen():
  → overlay plein écran (pas une sidebar)
  → 6 chaises dessinées en perspective isométrique légère
  → chaque chaise : prénom + indicateur état (stable / fragile / suspect)
  → tap sur une chaise : mini-fiche personnage (3 lignes max)
  → indicateur "⚠ place critique" sur la chaise 4 si seating_at_critical = swapB

Règle : le plan de table n'affiche jamais la valeur numérique des variables.
Il traduit visuellement l'état relationnel (couleur de la chaise, distance entre convives).
```

---

## Transitions entre scènes

```
sceneTransition(from, to):
  1. Fondu au noir (300ms)
  2. Son : verre posé ou couvert glissé (0.5s)
  3. Si chargement > 1.5s → afficher une phrase atmosphérique en blanc
     [pool de phrases tournantes — voir atmosphericLines ci-dessous]
  4. Fade-in scène suivante (400ms)

atmosphericLines: [
  "21h47. La soirée a sa propre logique maintenant.",
  "Quelqu'un va parler. Ce n'est peut-être pas toi.",
  "Tu te souviendras de ce moment, mais pas forcément correctement.",
  "La table est silencieuse pour quelques secondes de plus.",
  "Il reste encore du vin."
]
```

---

## Onboarding — Règles d'implémentation

**Déclenchement :** `localStorage.getItem('sln_firstPlay') === null`  
**Après completion :** `localStorage.setItem('sln_firstPlay', 'done')`  
**Accessible ensuite :** dans le carnet, section « Comment ça marche » → `onboarding.json.firstSceneIntro.notebookEntry`

**Principe cardinal :** l'onboarding ne s'appelle pas onboarding.  
Dans le jeu, c'est une « note trouvée dans le carnet avant d'entrer ».  
Jamais un écran « Bienvenue dans le jeu, voici les règles ».

---

## Navigation chapitre — Règles

| Élément | Recommandation |
|---|---|---|
| Numéro de scène | "Scène 3" — sans le total |
| Barre de progression | Absente. Trop spoilante sur la durée. |
| Bouton retour | Absent. Les décisions sont permanentes. |
| Bouton menu | Accessible via swipe depuis le bord gauche uniquement |
| Sauvegarde | Automatique à chaque choix confirmé. Pas de "Sauvegarder" manuel. |

---

*Daté 2026-08-01 — À relire après implémentation du composant `ScenePlayer` pour ajustement.*
