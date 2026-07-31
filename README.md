# Sous la nappe

> *Jeu narratif d'enquête psychologique à embranchements · 6 personnages jouables · 1 dîner*

![Logo Sous la nappe](public/logo.png)

*« Il n'y a pas une infinité de vérités. Il y a une charpente vraie, et tout le reste est ce que la soirée en a fait. »*

---

## Identité visuelle

| Élément | Valeur |
|---|---|
| Logo | `public/logo.png` — table dressée vue du dessus, nappe soulevée, main dans l'ombre, 6 chaises, 6 couverts |
| Thème | **Dark par défaut** (`data-theme="dark"` sur `<html>`) |
| Palette | Fond `#100e0c`, texte `#d4cfc8`, accent rouge sang `#c94040` |
| Typographie | Cormorant Garamond (display) + Inter (body) |
| Ambiance | Thriller psychologique, naturalisme sec, ivoire sur noir |

---

## Flow d'onboarding

```
/ (Landing — hero image logo plein écran)
  ↓ "Commencer"
/login (Auth)
  ↓ connexion réussie
/ ou /dashboard (Sélection personnage — 6 cartes avec portraits CSS)
  ↓ clic sur un personnage
/run/[runId] (Run — moteur narratif)
  ↓ scène 11 complète
/run/[runId]/final (Écran final — rapport + score + ending)
```

**Règles middleware :**
- `/run/*` et `/dashboard` → redirige vers `/login` si non connecté
- `/login` et `/register` → redirige vers `/` si déjà connecté
- `/` avec session active → redirige vers `/dashboard`

---

## Stack technique

- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Base de données** : Firebase Firestore
- **Auth** : Firebase Authentication
- **Hébergement** : Vercel
- **Styles** : CSS custom properties (design tokens dans `globals.css`)
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
| B-04 | Compléter `data/clues.json` — 25 indices (C-01 à C-25) | ✅ Fait | 25/25 indices |
| B-05 | Créer `data/locations.json` — maison, pièces, visibilités, règles d'observation | ✅ Fait | 7 pièces avec narrativeFunction, visibilityRule, linkedScenes, keyObjects |

---

### ✅ SPRINT 2 — Moteur narratif *(terminé le 31 juillet 2026)*

| # | Tâche | Statut | Notes |
|---|---|---|---|
| S2-01 | Créer `lib/engine/sceneRunner.ts` | ✅ Fait | `getScene`, `getAvailableChoices`, `applyChoice`, `applyOnEnterEffects` |
| S2-02 | Créer `lib/engine/transitions.ts` | ✅ Fait | `resolveTransition` avec bifurcations |
| S2-03 | Créer `lib/engine/clueResolver.ts` | ✅ Fait | `resolveClues`, `buildDiscoveredClue`, `countCriticalClues` |
| S2-04 | Créer `lib/engine/endingCalculator.ts` | ✅ Fait | `calculateEnding` (F1–F5, D1–D2, S1) + `buildFinalReport` |
| S2-05 | Créer `app/api/run/[runId]/advance/route.ts` | ✅ Fait | POST + GET |
| S2-06 | Compléter `store/runStore.ts` | ✅ Fait | `advance()` + `loadCurrentScene()` |
| S2-07 | Créer `scripts/seed-firestore.ts` | ✅ Fait | |
| S2-08 | Créer `scripts/validate-content.ts` | ✅ Fait | |

---

### ✅ SPRINT 3 — Composants persistants & run Lucas *(terminé le 31 juillet 2026)*

| # | Tâche | Statut | Notes |
|---|---|---|---|
| S3-01 | `SeatingPlan.tsx` — 4 états historisés | ✅ Fait | Avatars circulaires colorés, légende, `highlightSeat` |
| S3-02 à S3-12 | Scènes 1 à 11 branchées moteur | ✅ Fait | Via `SceneEngine` + API `/advance` |
| S3-06 | `MorpionMinigame.tsx` — scène 5 pivot causal | ✅ Fait | Sarah vs Yanis, `serviceHelper` écrit dans le run |

---

### ✅ ONBOARDING & VISUEL *(terminé le 31 juillet 2026)*

| # | Tâche | Statut | Notes |
|---|---|---|---|
| O-01 | Logo `public/logo.png` — table 6 chaises, main sous nappe | ✅ Fait | 800×800px, PNG optimisé |
| O-02 | Dark theme par défaut (`data-theme="dark"` sur `<html>`) | ✅ Fait | `app/layout.tsx` |
| O-03 | Landing `app/page.tsx` — hero plein écran logo + accroche + CTA | ✅ Fait | Image Next.js, dégradé bas, redirect si session |
| O-04 | `components/ui/CharacterCard.tsx` — portrait silhouette SVG + couleur | ✅ Fait | Initiale typographique en fond, halo coloré |
| O-05 | Dashboard `app/(game)/page.tsx` — grille 6 cartes + bandeau fixe | ✅ Fait | Bandeau slide-up à la sélection |
| O-06 | `middleware.ts` — flux auth complet | ✅ Fait | `/run/*`, `/dashboard` protégés ; `/login` redirige si connecté |

---

### 🟡 SPRINT 4 — Écran final & finition MVP

| # | Tâche | Statut | Notes |
|---|---|---|---|
| S4-01 | `app/(game)/run/[runId]/final/page.tsx` | ✅ Fait | Titre de fin, score /100, rapport 3 colonnes, CTA rejouer |
| S4-02 | `app/api/run/[runId]/final/route.ts` — endpoint rapport + score | ⬜ À faire | Appeler `buildFinalReport` + `scoringEngine` |
| S4-03 | Brancher indices critiques C-09, C-11, C-18, C-19, C-20, C-25 | ⬜ À faire | |
| S4-04 | Endings MVP (F1 canonique + D1 déviation) | ⬜ À faire | |
| S4-05 | Tests cohérence seeds + moteur | ⬜ À faire | `npx ts-node scripts/validate-content.ts` |
| S4-06 | Playtests run Lucas MVP | ⬜ À faire | |
| S4-07 | Ajustements UX post-playtest | ⬜ À faire | |
| S4-08 | Déploiement Vercel prod (env vars, règles Firestore) | ⬜ À faire | |

---

### ✅ DÉJÀ FAIT — Sprint 1 (Fondation)

| # | Tâche | Statut | Notes |
|---|---|---|---|
| S1-01 | Repo GitHub + Next.js/Firebase/Vercel | ✅ Fait | |
| S1-02 | Auth email/mot de passe | ✅ Fait | |
| S1-03 | Session cookie + middleware | ✅ Fait | |
| S1-04 | Types TS complets | ✅ Fait | |
| S1-05 | Schéma Firestore + règles | ✅ Fait | |
| S1-06 à S1-08 | Seeds JSON (characters, clues, endings) | ✅ Fait | |
| S1-09 | SDK Firebase admin + client | ✅ Fait | |
| S1-10 à S1-11 | Moteur déviation + flags narratifs | ✅ Fait | |
| S1-12 à S1-19 | API runs, composants UI, stores Zustand, bible narrative | ✅ Fait | |

---

## Structure du projet

```
sous-la-nappe/
├── app/
│   ├── page.tsx                  # Landing hero plein écran ★
│   ├── (game)/
│   │   ├── page.tsx              # Dashboard — sélection personnage ★
│   │   └── run/[runId]/
│   │       ├── page.tsx          # Run
│   │       └── final/page.tsx    # Écran final
│   └── api/run/[runId]/advance/  # Moteur narratif
├── components/ui/
│   ├── CharacterCard.tsx         # Portrait silhouette + couleur ★
│   ├── SceneEngine.tsx           # Moteur de scènes
│   ├── SeatingPlan.tsx           # Plan de table 4 états
│   ├── MorpionMinigame.tsx       # Mini-jeu pivot
│   └── CluePanel.tsx
├── lib/engine/                   # Moteur narratif complet
├── scripts/                      # Seed + validation
├── store/                        # Zustand
├── data/                         # JSON narratifs
└── public/
    └── logo.png                  # Logo final ★
```

> ★ = ajouté ou refactorisé (onboarding + Sprint 3)

## Installation

```bash
npm install
cp .env.local.example .env.local  # remplir les variables Firebase
npm run dev
```

## Seed Firestore

```bash
npx ts-node scripts/validate-content.ts
npx ts-node scripts/seed-firestore.ts
```

## Déploiement

Connecté à Vercel via GitHub. Chaque push sur `main` déclenche un déploiement automatique.

---

*Bible narrative v1.0 — 31 juillet 2026*
