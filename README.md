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

## Structure du projet

```
sous-la-nappe/
├── app/                    # App Router Next.js
│   ├── (game)/             # Routes du jeu
│   ├── (auth)/             # Routes d'auth
│   └── api/                # API Routes
├── components/             # Composants React
├── lib/                    # Firebase, helpers
├── store/                  # Zustand stores
├── types/                  # Types TypeScript
├── data/                   # Données narratives (JSON)
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
