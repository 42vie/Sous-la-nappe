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

### 🟠 SPRINT 2 — Moteur narratif

| # | Tâche | Statut | Notes |
|---|---|---|---|
| S2-01 | Créer `lib/engine/sceneRunner.ts` — chargeur de scène + résolveur de conditions | ⬜ À faire | Pièce centrale du moteur, tout en dépend |
| S2-02 | Créer `lib/engine/transitions.ts` — calcul de la scène suivante | ⬜ À faire | |
| S2-03 | Créer `lib/engine/clueResolver.ts` — dépôt/déverrouillage d'indices par scène | ⬜ À faire | |
| S2-04 | Créer `lib/engine/endingCalculator.ts` — calcul des fins selon variables | ⬜ À faire | |
| S2-05 | Créer `app/api/run/[runId]/advance/route.ts` — endpoint d'avancement de scène | ⬜ À faire | Manquant dans l'API actuelle |
| S2-06 | Compléter `store/runStore.ts` — brancher les appels moteur | ⬜ À faire | Store présent mais couplage moteur à vérifier |
| S2-07 | Créer `scripts/seed-firestore.ts` — script de seed automatisé | ⬜ À faire | |
| S2-08 | Créer `scripts/validate-content.ts` — vérification cohérence seeds + clés manquantes | ⬜ À faire | |

---

### 🟡 SPRINT 3 — Composants persistants & run Lucas

| # | Tâche | Statut | Notes |
|---|---|---|---|
| S3-01 | Compléter `components/ui/SeatingPlan.tsx` — ajouter les 4 états historisés (`seating_planned` → `seating_before_main` → `seating_at_critical` → `seating_after_incident`) | ⬜ À faire | Actuellement à 2,7 Ko — probablement sans l'historique |
| S3-02 | Implémenter scène 1 (souvenir d'ouverture) dans `SceneEngine.tsx` | ⬜ À faire | |
| S3-03 | Implémenter scène 2 (arrivée) | ⬜ À faire | |
| S3-04 | Implémenter scène 3 (premiers échanges) | ⬜ À faire | |
| S3-05 | Implémenter scène 4 (mise à table) | ⬜ À faire | |
| S3-06 | Implémenter scène 5 — mini-jeu morpion (détermine `serviceHelper`) | ⬜ À faire | **Pivot causal du drame** — Sarah perd → `serviceHelper: "sarah"` dans le run T0 |
| S3-07 | Implémenter scène 6 — cuisine, reflet, observation partielle + dépôt indice C-11 | ⬜ À faire | Indice critique du POV Lucas |
| S3-08 | Implémenter scène 7 — humiliation de Sarah + déplacement des places | ⬜ À faire | Met à jour `seating_at_critical` |
| S3-09 | Implémenter scène 8 — service critique + mini-jeu dosage/ordre du passe | ⬜ À faire | Écrit `targetActual` ≠ `targetPlanned` |
| S3-10 | Implémenter scène 9 — incident | ⬜ À faire | |
| S3-11 | Implémenter scène 10 — après-coup, silence, vocal, construction du récit | ⬜ À faire | Indice C-20 (vocal Maëlys sur téléphone Lucas) |
| S3-12 | Implémenter scène 11 — reconstruction et réponses finales | ⬜ À faire | |

---

### 🟢 SPRINT 4 — Écran final & finition MVP

| # | Tâche | Statut | Notes |
|---|---|---|---|
| S4-01 | Créer `app/(game)/run/[runId]/final/page.tsx` — écran final complet | ⬜ À faire | Dossier présent, page absente |
| S4-02 | Implémenter le calcul du `final_report` (écart prévu / réel / dit) | ⬜ À faire | Brancher `lib/firebase/scores.ts` + `endingCalculator.ts` |
| S4-03 | Brancher les indices critiques C-09, C-11, C-18, C-19, C-20, C-25 au système de progression | ⬜ À faire | |
| S4-04 | Implémenter les endings MVP (fin canonique + 1 fin déviée minimum) | ⬜ À faire | |
| S4-05 | Tests de cohérence seeds + règles moteur | ⬜ À faire | |
| S4-06 | Playtests run Lucas MVP (mémorisation portage assiettes + compréhension seating) | ⬜ À faire | |
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
| S1-07 | Seeds `clues.json` — 25/25 indices | ✅ Fait | Complété dans le sprint bloquant |
| S1-08 | Seeds `endings.json` | ✅ Fait | |
| S1-09 | SDK Firebase admin + client (`lib/firebase/admin.ts`, `client.ts`) | ✅ Fait | |
| S1-10 | Moteur de déviation `lib/engine/deviation.ts` (couches 1–4) | ✅ Fait | Couches hostIntent, seatingVariant, serviceHelperFactor, targetActual |
| S1-11 | Flags narratifs `lib/engine/flags.ts` (22 flags, 6 phases) | ✅ Fait | |
| S1-12 | API runs (`app/api/run/route.ts`, `app/api/run/[runId]/route.ts`) | ✅ Fait | |
| S1-13 | Page run `app/(game)/run/[runId]/page.tsx` | ✅ Fait | |
| S1-14 | Composant `SceneEngine.tsx` (21,5 Ko) | ✅ Fait | Profondeur à valider en Sprint 2 |
| S1-15 | Composant `CluePanel.tsx` | ✅ Fait | |
| S1-16 | Composant `SeatingPlan.tsx` (base) | ✅ Fait | Historique 4 états manquant — voir S3-01 |
| S1-17 | Composant `CharacterSelector.tsx` | ✅ Fait | |
| S1-18 | Stores Zustand `authStore.ts` + `runStore.ts` | ✅ Fait | |
| S1-19 | Bible narrative versionnée `Sous_la_nappe_Scenario_complet_v1.pdf` | ✅ Fait | |

---

## Structure du projet

```
sous-la-nappe/
├── app/                    # App Router Next.js
│   ├── (game)/             # Routes du jeu
│   ├── (auth)/             # Routes d'auth
│   └── api/                # API Routes
├── components/             # Composants React
│   └── ui/                 # AuthForm, SceneEngine, CluePanel, SeatingPlan...
├── lib/
│   ├── engine/             # deviation.ts, flags.ts (+ à créer)
│   ├── firebase/           # admin, client, auth, runs, scores
│   └── types/              # characters, scenes, clues, endings, engine, house
├── store/                  # authStore, runStore
├── types/                  # index.ts, firebase.ts
├── data/                   # JSON narratifs (seeds) — complets
└── public/                 # Assets statiques
```

## Installation

```bash
npm install
```

Copier `.env.local.example` en `.env.local` et remplir les variables Firebase.

```bash
npm run dev
```

## Variables d'environnement

Voir `.env.local.example` pour la liste complète.

## Déploiement

Connecté à Vercel via GitHub. Chaque push sur `main` déclenche un déploiement.

---

*Bible narrative v1.0 — 31 juillet 2026*
