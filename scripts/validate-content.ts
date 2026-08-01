#!/usr/bin/env ts-node
/**
 * validate-content.ts
 * Vérifie la cohérence des seeds JSON avant seed ou déploiement.
 * Usage : npx ts-node scripts/validate-content.ts
 */
import * as fs from 'fs'
import * as path from 'path'

const DATA_DIR = path.join(__dirname, '..', 'data')

let errors = 0
let warnings = 0

function error(msg: string) {
  console.error(`  ❌ ${msg}`)
  errors++
}

function warn(msg: string) {
  console.warn(`  ⚠️  ${msg}`)
  warnings++
}

function ok(msg: string) {
  console.log(`  ✅ ${msg}`)
}

function load<T>(filename: string): T | null {
  const p = path.join(DATA_DIR, filename)
  if (!fs.existsSync(p)) {
    error(`Fichier manquant : ${filename}`)
    return null
  }
  return JSON.parse(fs.readFileSync(p, 'utf-8')) as T
}

function main() {
  console.log('\n🔍 Validation des seeds — Sous la nappe\n')

  // --- Clues ---
  const clues = load<Array<{ ref: string }>>('clues.json')
  if (clues) {
    const clueRefs = clues.map((c) => c.ref)
    ok(`clues.json : ${clues.length} indices`)
    if (clues.length < 25) warn(`Seulement ${clues.length}/25 indices présents`)
    const expected = Array.from({ length: 25 }, (_, i) => `C-${String(i + 1).padStart(2, '0')}`)
    for (const ref of expected) {
      if (!clueRefs.includes(ref)) warn(`Indice manquant : ${ref}`)
    }
  }

  // --- Scenes ---
  const scenes = load<Array<{ id: string; index: number; choices: Array<{ id: string; revealsClue?: string | string[] }> }>>('scenes.json')
  if (scenes && clues) {
    ok(`scenes.json : ${scenes.length} scènes`)
    // 11 scènes canoniques + scènes inter-chapitres de l'expansion v3
    // (S01b-S09b) — le total grandit à mesure que l'expansion avance
    // (docs/expansion-v3-histoires-interactions.md), plus un compte fixe.
    if (scenes.length < 11) error(`Attendu au moins 11 scènes, trouvé ${scenes.length}`)
    const clueRefs = clues.map((c) => c.ref)
    for (const scene of scenes) {
      for (const choice of scene.choices) {
        if (!choice.revealsClue) continue
        const revealed = Array.isArray(choice.revealsClue) ? choice.revealsClue : [choice.revealsClue]
        for (const ref of revealed) {
          if (!clueRefs.includes(ref)) {
            error(`Scène ${scene.id} — choix ${choice.id} référence l'indice inconnu : ${ref}`)
          }
        }
      }
    }
    const indices = scenes.map((s) => s.index).sort((a, b) => a - b)
    for (let i = 0; i < 11; i++) {
      if (indices[i] !== i + 1) error(`Index de scène manquant ou en double : ${i + 1}`)
    }
  }

  // --- Questions finales ---
  const questions = load<Array<{ id: string; weight: number; revealedBy: string[] }>>('questions_final.json')
  if (questions) {
    ok(`questions_final.json : ${questions.length} questions`)
    if (questions.length !== 8) error(`Attendu 8 questions, trouvé ${questions.length}`)
    const totalWeight = questions.reduce((s, q) => s + q.weight, 0)
    if (totalWeight !== 100) error(`Total des poids = ${totalWeight}, attendu 100`)
    if (clues) {
      const clueRefs = clues.map((c) => c.ref)
      for (const q of questions) {
        for (const ref of q.revealedBy) {
          if (!clueRefs.includes(ref)) warn(`Question ${q.id} référence l'indice inconnu : ${ref}`)
        }
      }
    }
  }

  // --- Canon runs ---
  const canon = load<Record<string, { variables: Record<string, unknown> }>>('canon_runs.json')
  if (canon) {
    ok(`canon_runs.json : ${Object.keys(canon).length} run(s)`)
    if (!canon['T0']) error('canon_runs.json : run T0 manquant')
    if (canon['T0']) {
      const v = canon['T0'].variables
      if (!v['serviceHelper']) error('T0 : serviceHelper manquant')
      if (!v['targetPlanned']) error('T0 : targetPlanned manquant')
      if (!v['targetActual']) error('T0 : targetActual manquant')
      if (!v['seatingVariant']) error('T0 : seatingVariant manquant')
    }
  }

  // --- Locations ---
  const locations = load<Array<{ id: string }>>('locations.json')
  if (locations) {
    ok(`locations.json : ${locations.length} pièces`)
    const required = ['dining_room', 'pass_through', 'kitchen', 'living_room']
    for (const r of required) {
      if (!locations.some((l) => l.id === r)) error(`Pièce requise manquante : ${r}`)
    }
  }

  // --- Résumé ---
  console.log(`\n--- Résultat ---`)
  console.log(`Erreurs   : ${errors}`)
  console.log(`Avertissements : ${warnings}`)
  if (errors === 0) {
    console.log('\n✨ Validation réussie. Seeds prêts pour le seed Firestore.\n')
    process.exit(0)
  } else {
    console.log('\n❌ Validation échouée. Corriger avant de seeder.\n')
    process.exit(1)
  }
}

main()
