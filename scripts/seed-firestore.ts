#!/usr/bin/env ts-node
/**
 * seed-firestore.ts
 * Charge tous les JSON de data/ dans Firestore (collections: scenes, clues, endings, characters, locations)
 * Usage : npx ts-node scripts/seed-firestore.ts
 */
import * as admin from 'firebase-admin'
import * as fs from 'fs'
import * as path from 'path'

const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ?? path.join(__dirname, '..', 'serviceAccountKey.json')

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  })
}

const db = admin.firestore()

const DATA_DIR = path.join(__dirname, '..', 'data')

const SEED_MAP: Record<string, string> = {
  'scenes.json': 'scenes',
  'clues.json': 'clues',
  'endings.json': 'endings',
  'characters.json': 'characters',
  'locations.json': 'locations',
  'questions_final.json': 'questions_final',
}

async function seedCollection(
  collectionName: string,
  items: Record<string, unknown>[],
  idField: string
): Promise<void> {
  const batch = db.batch()
  let count = 0

  for (const item of items) {
    const id = String(item[idField] ?? item['ref'] ?? item['id'])
    if (!id) {
      console.warn(`  [warn] item sans id dans ${collectionName}, ignoré`)
      continue
    }
    const ref = db.collection(collectionName).doc(id)
    batch.set(ref, item, { merge: true })
    count++
    // Firestore batch limit = 500
    if (count % 499 === 0) {
      await batch.commit()
      console.log(`  [commit] ${count} docs dans ${collectionName}`)
    }
  }

  await batch.commit()
  console.log(`✅ ${collectionName} : ${count} documents seedés`)
}

async function main() {
  console.log('\n🌱 Seed Firestore — Sous la nappe\n')

  for (const [filename, collectionName] of Object.entries(SEED_MAP)) {
    const filePath = path.join(DATA_DIR, filename)
    if (!fs.existsSync(filePath)) {
      console.warn(`⚠️  ${filename} introuvable, passé`)
      continue
    }

    const raw = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(raw)
    const items: Record<string, unknown>[] = Array.isArray(data)
      ? data
      : Object.values(data)

    console.log(`📦 Seed ${collectionName} (${items.length} items)...`)
    await seedCollection(collectionName, items, 'id')
  }

  // Seed canon_runs séparément (structure objet, pas tableau)
  const canonPath = path.join(DATA_DIR, 'canon_runs.json')
  if (fs.existsSync(canonPath)) {
    const canonData = JSON.parse(fs.readFileSync(canonPath, 'utf-8'))
    const batch = db.batch()
    for (const [key, value] of Object.entries(canonData)) {
      batch.set(db.collection('canon_runs').doc(key), value as Record<string, unknown>, { merge: true })
    }
    await batch.commit()
    console.log('✅ canon_runs : T0 seedé')
  }

  console.log('\n✨ Seed terminé.\n')
  process.exit(0)
}

main().catch((err) => {
  console.error('Erreur seed:', err)
  process.exit(1)
})
