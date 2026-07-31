// POST /api/run/new — crée un nouveau run et redirige vers /run/:id
import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase/admin'
import { COLLECTIONS } from '@/types/firebase'
import { INITIAL_CHARACTER_STATE } from '@/lib/types/characters'
import type { CharacterId } from '@/lib/types/characters'

export async function POST(req: NextRequest) {
  try {
    // Vérifier la session
    const session = req.cookies.get('__session')?.value
    if (!session) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    let uid: string
    try {
      const decoded = await adminAuth.verifySessionCookie(session, true)
      uid = decoded.uid
    } catch {
      return NextResponse.json({ error: 'Session invalide' }, { status: 401 })
    }

    const { character } = await req.json() as { character: CharacterId }
    const validCharacters: CharacterId[] = ['maelys', 'noe', 'ines', 'lucas', 'sarah', 'yanis']
    if (!validCharacters.includes(character)) {
      return NextResponse.json({ error: 'Personnage invalide' }, { status: 400 })
    }

    // Créer le run Firestore
    const runRef = adminDb.collection(COLLECTIONS.runs).doc()
    const now = Date.now()

    await runRef.set({
      id: runRef.id,
      playerId: uid,
      playerCharacter: character,
      currentScene: 1,
      discoveredClues: [],
      flags: {
        // Flags de fond (chapitre 3) activés dès le début
        groupe_mythe_actif: true,
        lucas_role_confident: true,
        ines_admiration_maelys: true,
        maison_titre_noe_seul: true,
        maelys_preuves_financieres: true,
        maelys_investissement_invisible: true,
        lucas_savait_dettes: true,
        ines_intrusion_telephone: true,
        ines_participation_vente: true,
        noe_dettes_dissimulees: true,
        maelys_invalidation_publique: true,
        sarah_episode_hiver: true,
        noe_sarah_messages_nuit: true,
        maelys_soin_sarah: true,
        maelys_a_vu_captures: true,
        maelys_a_vu_messages: true,
        lucas_detient_vocal: true,
        sarah_silence_coupable: true,
        noe_promesses_non_tenues: true,
        vente_engagee: true,
        yanis_version_edulcoree: true,
        invitation_faux_pretexte: true,
      },
      sceneChoices: {},
      characterState: INITIAL_CHARACTER_STATE,
      isComplete: false,
      createdAt: now,
      updatedAt: now,
    })

    return NextResponse.json({ runId: runRef.id })
  } catch (err) {
    console.error('[POST /api/run/new]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
