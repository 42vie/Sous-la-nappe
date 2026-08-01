# Sous la nappe — Manifest des illustrations

Complète `docs/prompts-visuels.md` (les 35 prompts) avec les chemins exacts
attendus par l'app. Génère chaque image avec l'outil de ton choix à partir
du prompt correspondant, puis dépose le fichier au chemin indiqué, dans
`public/images/`. Aucun redéploiement de code n'est nécessaire : les
composants (`ImageSlot`) affichent l'image dès qu'elle existe à ce chemin
exact, et restent invisibles tant qu'elle n'y est pas — rien ne casse
entre-temps.

Format recommandé : `.jpg`, orientation et ratio suggérés entre
parenthèses. Le nom de fichier doit être EXACTEMENT celui indiqué
(minuscules, tirets, extension `.jpg`).

---

## 1. Hero image accueil

| Chemin | Prompt (section) |
|---|---|
| `public/images/hero-accueil.jpg` | § 1. Hero image accueil (16:9) |

Affichée en fond de l'en-tête du dashboard (`/dashboard`).

---

## 2. Portraits personnages

Affichés sur les cartes de sélection de personnage (`/dashboard`), format
portrait (ratio 3:4 recommandé).

| Chemin | Prompt (section) |
|---|---|
| `public/images/portraits/maelys.jpg` | § Maëlys Renaud — portrait principal |
| `public/images/portraits/maelys-cuisine.jpg` | § Maëlys — variante cuisine |
| `public/images/portraits/noe.jpg` | § Noé Varnier — portrait principal |
| `public/images/portraits/noe-hopital.jpg` | § Noé — variante fin hôpital |
| `public/images/portraits/ines.jpg` | § Inès Varnier — portrait principal |
| `public/images/portraits/ines-table.jpg` | § Inès — variante à table |
| `public/images/portraits/lucas.jpg` | § Lucas Berthier — portrait principal |
| `public/images/portraits/sarah.jpg` | § Sarah Kessler — portrait principal |
| `public/images/portraits/sarah-instable.jpg` | § Sarah — variante perte de stabilité |
| `public/images/portraits/yanis.jpg` | § Yanis Amrani — portrait principal |
| `public/images/portraits/yanis-revelation.jpg` | § Yanis — variante révélation tardive |

Seuls `maelys.jpg`, `noe.jpg`, `ines.jpg`, `lucas.jpg`, `sarah.jpg`,
`yanis.jpg` (les 6 portraits principaux) sont câblés dans l'UI aujourd'hui
(`CharacterCard`, sélection de personnage). Les variantes existent en tant
que prompts prêts mais n'ont pas encore d'emplacement dans le code — à
brancher plus tard (écran de fin par exemple, où le personnage touché
pourrait afficher sa variante dramatique).

---

## 3. Pièces et décors

Alignés sur les identifiants de `data/locations.json`. Utilisés comme
bannière de scène (16:9), voir `lib/engine/sceneImages.ts`.

| Chemin | Prompt (section) | Utilisé dans |
|---|---|---|
| `public/images/rooms/salle-a-manger.jpg` | § Salle à manger | scène 11 |
| `public/images/rooms/passe.jpg` | § Le passe | (pas encore câblé) |
| `public/images/rooms/cuisine.jpg` | § Cuisine | (pas encore câblé — voir moments/reflet-cuisine) |
| `public/images/rooms/salon.jpg` | § Salon | scène 3 |
| `public/images/rooms/terrasse.jpg` | § Terrasse | (pas encore câblé) |
| `public/images/rooms/couloir.jpg` | § Couloir | scène 2 |
| `public/images/rooms/etage.jpg` | § Étage | (pas encore câblé) |

---

## 4. Objets et indices

Pas encore câblés dans l'UI (candidats naturels : `CluePanel`, l'écran
d'indice au moment de la découverte). Prompts prêts pour plus tard.

| Chemin | Prompt (section) | Indice |
|---|---|---|
| `public/images/objects/photo-couloir.jpg` | § Photo du couloir | C-03 |
| `public/images/objects/recipient-gres.jpg` | § Récipient en grès | C-09 |
| `public/images/objects/vitre-cellier.jpg` | § Vitre du cellier | C-11 |
| `public/images/objects/boites-traitement.jpg` | § Boîtes de traitement / pilulier absent | C-02 / C-18 |
| `public/images/objects/telephone-noe.jpg` | § Téléphone de Noé | C-23 |
| `public/images/objects/carnet-maelys.jpg` | § Carnet de Maëlys | C-22 |
| `public/images/objects/assiette-critique.jpg` | § Assiette critique | — |

---

## 5. Moments narratifs

Utilisés comme bannière de scène (16:9), voir `lib/engine/sceneImages.ts`.

| Chemin | Prompt (section) | Utilisé dans |
|---|---|---|
| `public/images/moments/mise-a-table.jpg` | § Mise à table | scène 4 |
| `public/images/moments/minijeu-social.jpg` | § Mini-jeu social | scènes 5 et 7 |
| `public/images/moments/reflet-cuisine.jpg` | § Reflet cuisine (S06) | scène 6 |
| `public/images/moments/humiliation-sarah.jpg` | § Humiliation de Sarah | (pas encore câblé) |
| `public/images/moments/service-critique.jpg` | § Service critique (S08) | scène 8 |
| `public/images/moments/incident.jpg` | § Incident | scène 9 |
| `public/images/moments/apres-coup.jpg` | § Après-coup | scène 10 |
| `public/images/moments/noe-hopital.jpg` | § Noé à l'hôpital (fin F0) | (pas encore câblé — écran de fin) |

---

## Ce qui est déjà branché vs à faire

**Câblé aujourd'hui** (dépose l'image, elle apparaît sans toucher au code) :
- Hero accueil → `/dashboard`
- 6 portraits principaux → cartes de sélection de personnage
- Bannières de scène (rooms + moments listés ci-dessus) → écran de jeu, scènes 2 à 11

**Prompts prêts, pas encore câblés dans l'UI** (à faire dans une prochaine
passe si utile) : variantes de portraits dramatiques, objets/indices,
`passe`/`terrasse`/`étage`, moment "humiliation de Sarah", écran de fin.
