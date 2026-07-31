# Sous la nappe

> *Jeu narratif d'enquête psychologique à embranchements · 6 personnages jouables · 1 dîner*

"Il n'y a pas une infinité de vérités. Il y a une charpente vraie, et tout le reste est ce que la soirée en a fait."

---

## Stack technique

- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Base de données** : Firebase Firestore
- **Auth** : Firebase Authentication
- **Hébergement** : Vercel
- **Styles** : Tailwind CSS v4
- **State management** : Zustand

---

## Plan d'action — Suivi de progression

> **Note pour l'assistant IA** : Ce tableau est la source de vérité de l'avancement du projet.
> À chaque fois qu'une tâche est accomplie (fichier créé, fonctionnalité implémentée, bug corrigé),
> mettre à jour la case de statut correspondante : `⬜ À faire` → `🟡 En cours` → `✅ Fait`.
> Ne jamais supprimer une ligne, même terminée. Ajouter les nouvelles tâches en bas de leur sprint.

---

### ✅ BLOQUANT — Données canoniques *(terminé le 31 juillet 2026)*

| # | Tâche | Statut | Notes |
|---|---|---|---|
| B-01 | Créer `data/scenes.json` — 11 scènes run Lucas (conditions, choix, effets, indices) | ✅ Fait | 11 scènes complètes avec choices, effects, canonicalFacts, autoRevealClues |
| B-02 | Créer `data/canon_runs.json` — run T0 comme trajectoire de référence | ✅ Fait | T0 complet : variables, seatingHistory, keyChoices, finalReport 3 colonnes |
| B-03 | Créer `data/questions_final.json` — 8 questions pondérées de l'écran final | ✅ Fait | 8 questions avec options, scoreDelta, canonicalAnswer, mappedVariable, revealedBy |
| B-04 | Compléter `data/clues.json` — 25 indices (C-01 à C-25) | ✅ Fait | 25/25 indices — C-04, C-06, C-08, C-10, C-12, C-13, C-16, C-17, C-21, C-24 ajoutés |
| B-05 | Créer `data/locations.json` — maison, pièces, visibilités, règles d'observation | ✅ Fait | 7 pièces avec narrativeFunction, visibilityRule, linkedScenes, keyObjects |

---

### ✅ SPRINT 2 — Moteur narratif *(terminé le 31 juillet 2026)*

| # | Tâche | Statut | Notes |
|---|---|---|---|
| S2-01 | Créer `lib/engine/sceneRunner.ts` — chargeur de scène + résolveur de conditions | ✅ Fait | `getScene`, `getAvailableChoices`, `applyChoice`, `applyOnEnterEffects` |
| S2-02 | Créer `lib/engine/transitions.ts` — calcul de la scène suivante | ✅ Fait | `resolveTransition` avec bifurcations lucas_a_interrompu_service + confrontation |
| S2-03 | Créer `lib/engine/clueResolver.ts` — dépôt/déverrouillage d'indices par scène | ✅ Fait | `resolveClues`, `buildDiscoveredClue`, `countCriticalClues` (7 indices critiques) |
| S2-04 | Créer `lib/engine/endingCalculator.ts` — calcul des fins selon variables | ✅ Fait | `calculateEnding` (F1–F5, D1–D2, S1) + `buildFinalReport` (3 colonnes) |
| S2-05 | Créer `app/api/run/[runId]/advance/route.ts` — endpoint d'avancement de scène | ✅ Fait | POST (appliquer choix) + GET (charger scène courante + choix disponibles) |
| S2-06 | Compléter `store/runStore.ts` — brancher les appels moteur | ✅ Fait | `advance()` + `loadCurrentScene()` ajoutés, sync Firestore via `run.runId` |
| S2-07 | Créer `scripts/seed-firestore.ts` — script de seed automatisé | ✅ Fait | Seed 7 collections + canon_runs, batch Firestore, `npx ts-node scripts/seed-firestore.ts` |
| S2-08 | Créer `scripts/validate-content.ts` — vérification cohérence seeds + clés manquantes | ✅ Fait | Vérifie clues (25), scenes (11), poids questions (= 100), canon T0, pièces requises |

---

### ✅ SPRINT 3 — Composants persistants & run Lucas *(terminé le 31 juillet 2026)*

| # | Tâche | Statut | Notes |
|---|---|---|---|
| S3-01 | Compléter `components/ui/SeatingPlan.tsx` — 4 états historisés | ✅ Fait | `SeatingGrid` par snapshot, avatars circulaires colorés, légende, `highlightSeat` pour scène 8 |
| S3-02 | Scène 1 — souvenir d'ouverture | ✅ Fait | Branchée sur `/api/run/[runId]/advance` via `SceneEngine` |
| S3-03 | Scène 2 — arrivée | ✅ Fait | id: scene_02_arrival |
| S3-04 | Scène 3 — premiers échanges | ✅ Fait | id: scene_03_first_exchanges |
| S3-05 | Scène 4 — mise à table | ✅ Fait | id: scene_04_seating |
| S3-06 | Scène 5 — mini-jeu morpion (`serviceHelper`) | ✅ Fait | `MorpionMinigame.tsx` — Sarah vs Yanis, perdant sert, `serviceHelper` écrit dans le run |
| S3-07 | Scène 6 — cuisine, reflet, indice C-11 | ✅ Fait | id: scene_06_kitchen_aside |
| S3-08 | Scène 7 — humiliation de Sarah + déplacement des places | ✅ Fait | id: scene_07_social_game_2 |
| S3-09 | Scène 8 — service critique + `targetActual` | ✅ Fait | id: scene_08_critical_service, `highlightSeat=2` dans SeatingPlan |
| S3-10 | Scène 9 — incident | ✅ Fait | id: scene_09_incident |
| S3-11 | Scène 10 — après-coup, vocal, construction du récit | ✅ Fait | id: scene_10_aftermath, C-20 |
| S3-12 | Scène 11 — reconstruction et réponses finales | ✅ Fait | id: scene_11_reconstruction, `router.push(‘final’)` |

---

### 🟡 SPRINT 4 — Écran final & finition MVP

| # | Tâche | Statut | Notes |
|---|---|---|---|
| S4-01 | Créer `app/(game)/run/[runId]/final/page.tsx` — écran final complet | ✅ Fait | Titre de fin, description, score /100, rapport 3 colonnes (prévu/réel/dit), CTA rejouer |
| S4-02 | Implémenter `app/api/run/[runId]/final/route.ts` — endpoint rapport + score | ⬜ À faire | Appeler `buildFinalReport` + `scoringEngine` |
| S4-03 | Brancher les indices critiques C-09, C-11, C-18, C-19, C-20, C-25 au système de progression | ⬜ À faire | Vérifier que `clueResolver` les passe bien à l'écran final |
| S4-04 | Implémenter les endings MVP (fin canonique F1 + D1 déviée minimum) | ⬜ À faire | Labels déjà dans `final/page.tsx`, reste à vérifier le routage `isComplete` |
| S4-05 | Tests de cohérence seeds + règles moteur | ⬜ À faire | `npx ts-node scripts/validate-content.ts` |
| S4-06 | Playtests run Lucas MVP | ⬜ À faire | |
| S4-07 | Ajustements UX post-playtest | ⬜ À faire | |
| S4-08 | Préparation déploiement Vercel (env vars, règles Firestore prod) | ⬜ À faire | |

---

### ✅ DÉJÀ FAIT — Sprint 1 (Fondation)

| # | Tâche | Statut | Notes |
|---|---|---|---|
| S1-01 | Repo GitHub initialisé + configuration Next.js/Firebase/Vercel | ✅ Fait | |
| S1-02 | Auth email/mot de passe (`lib/firebase/auth.ts`) | ✅ Fait | |
| S1-03 | Session cookie + middleware routes protégées (`middleware.ts`) | ✅ Fait | |
| S1-04 | Types TS — characters, scenes, clues, endings, engine, house | ✅ Fait | Dans `lib/types/` |
| S1-05 | Schéma Firestore + règles (`firestore.rules`, `firestore.indexes.json`) | ✅ Fait | |
| S1-06 | Seeds `characters.json` | ✅ Fait | |
| S1-07 | Seeds `clues.json` — 25/25 indices | ✅ Fait | |
| S1-08 | Seeds `endings.json` | ✅ Fait | |
| S1-09 | SDK Firebase admin + client (`lib/firebase/admin.ts`, `client.ts`) | ✅ Fait | |
| S1-10 | Moteur de déviation `lib/engine/deviation.ts` (couches 1–4) | ✅ Fait | |
| S1-11 | Flags narratifs `lib/engine/flags.ts` (22 flags, 6 phases) | ✅ Fait | |
| S1-12 | API runs (`app/api/run/route.ts`, `app/api/run/[runId]/route.ts`) | ✅ Fait | |
| S1-13 | Page run `app/(game)/run/[runId]/page.tsx` | ✅ Fait | Refactorisée Sprint 3 : Zustand store + `playerPov` |
| S1-14 | Composant `SceneEngine.tsx` | ✅ Fait | Refactorisé Sprint 3 : branché API moteur S2 |
| S1-15 | Composant `CluePanel.tsx` | ✅ Fait | |
| S1-16 | Composant `SeatingPlan.tsx` | ✅ Fait | Refactorisé Sprint 3 : 4 états historisés |
| S1-17 | Composant `CharacterSelector.tsx` | ✅ Fait | |
| S1-18 | Stores Zustand `authStore.ts` + `runStore.ts` | ✅ Fait | Sprint 2–3 : `advance()`, `loadCurrentScene()` |
| S1-19 | Bible narrative versionnée `Sous_la_nappe_Scenario_complet_v1.pdf` | ✅ Fait | |

---

## Structure du projet

```
sous-la-nappe/
├── app/
│   ├── (game)/run/[runId]/
│   │   ├── page.tsx              # Run (Zustand, SceneEngine branché API) ★
│   │   └── final/page.tsx        # Écran final (rapport 3 col, score, endings) ★
│   └── api/run/
│       ├── route.ts              # POST créer run
│       └── [runId]/
│           ├── route.ts            # GET run
│           └── advance/route.ts    # POST/GET avancer scène
├── components/ui/
│   ├── SceneEngine.tsx           # Branché API moteur, phases, minijeu ★
│   ├── SeatingPlan.tsx           # 4 états historisés, avatars colorés ★
│   ├── MorpionMinigame.tsx       # Minijeu morpion scène 5 (pivot causal) ★
│   ├── CluePanel.tsx
│   └── CharacterSelector.tsx
├── lib/engine/
│   ├── deviation.ts
│   ├── flags.ts
│   ├── sceneRunner.ts
│   ├── transitions.ts
│   ├── clueResolver.ts
│   └── endingCalculator.ts
├── scripts/
│   ├── seed-firestore.ts
│   └── validate-content.ts
├── store/                        # authStore, runStore
├── data/                         # JSON narratifs — complets
└── public/
```

> ★ = ajouté ou refactorisé en Sprint 3

## Installation

```bash
npm install
```

Copier `.env.local.example` en `.env.local` et remplir les variables Firebase.

```bash
npm run dev
```

## Seed Firestore (une seule fois)

```bash
npx ts-node scripts/validate-content.ts   # vérifier avant
npx ts-node scripts/seed-firestore.ts      # seeder
```

## Variables d'environnement

Voir `.env.local.example` pour la liste complète.

## Déploiement

Connecté à Vercel via GitHub. Chaque push sur `main` déclenche un déploiement.

---

*Bible narrative v1.0 — 31 juillet 2026*
