'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useRunStore } from '@/store/runStore'
import { CluePanel } from './CluePanel'
import type { CharacterId } from '@/lib/types/characters'

// Données de scènes embarquées (pas de fetch, tout client-side)
const SCENES: {
  id: string
  index: number
  title: string
  time: string
  narrativeBlocks: Partial<Record<CharacterId, string>> & { default: string }
  choices: {
    id: string
    verb: string
    label: string
    availableFor: CharacterId[] | 'all'
    revealsClue?: string
    flagSet?: string
  }[]
}[] = [
  {
    id: 'scene_01_opening_memory',
    index: 1,
    title: 'Le souvenir planté',
    time: '18h30',
    narrativeBlocks: {
      default: 'Les invités n\'ont pas encore sonné. Vous êtes seul·e dans la maison. Quelque chose dans l\'air ne ressemble pas à une soirée ordinaire.',
      maelys: 'Vous avez relu la liste trois fois. Chaque chose est à sa place. Chaque chose, sauf Noé — qui n\'a pas encore confirmé.',
      lucas: 'Vous êtes arrivé en avance, comme toujours. Maëlys vous a ouvert avant que vous frappiez. Elle avait l\'air de vous attendre, pas vous.',
      sarah: 'L\'entrée sent la cire chaude et quelque chose d\'autre — sucré, un peu trop fort. Vous essayez de vous souvenir si c\'est normal chez elle.',
      yanis: 'Vous avez sonné à 18h32. Maëlys avait les yeux brillants. Pas de larmes. Autre chose.',
      noe: 'Son message disait : "J\'ai besoin que tu sois là." Vous n\'auriez pas dû venir. Vous le savez.',
      ines: 'Noé conduit. Vous regardez la maison par la fenêtre. Quelque chose a changé dans la façon dont Maëlys a disposé les lumières.',
    },
    choices: [
      { id: 'c1_observe', verb: 'observer', label: 'Observer la pièce en silence', availableFor: 'all', flagSet: 'observed_opening' },
      { id: 'c1_clue_c03', verb: 'regarder', label: 'Remarquer la photo dans le couloir', availableFor: 'all', revealsClue: 'C-03' },
      { id: 'c1_clue_c05', verb: 'écouter', label: 'Entendre quelque chose à l\'étage', availableFor: ['yanis'], revealsClue: 'C-05' },
    ],
  },
  {
    id: 'scene_02_arrival',
    index: 2,
    title: 'Les arrivées',
    time: '18h50 – 19h30',
    narrativeBlocks: {
      default: 'Les invités arrivent par petits groupes. Les premières politesses s\'échangent. Quelque chose se pose déjà — une tension que personne ne nomme.',
      maelys: 'Chaque arrivée est un calcul. Vous souriez, vous placez les manteaux, vous regardez la porte. Noé n\'est pas là.',
      lucas: 'Vous regardez Maëlys accueillir les gens. Elle est précise, presque mécanique. Elle compte quelque chose.',
      sarah: 'Maëlys vous serre dans ses bras plus longtemps que d\'habitude. "Tu as l\'air fatiguée", dit-elle. Ce n\'est pas une question.',
    },
    choices: [
      { id: 'c2_listen', verb: 'écouter', label: 'Écouter les échanges autour de vous', availableFor: 'all' },
      { id: 'c2_clue_c01', verb: 'regarder', label: 'Voir le téléphone de Noé allumé sur la table', availableFor: ['noe'], revealsClue: 'C-01' },
      { id: 'c2_speak', verb: 'parler', label: 'Engager la conversation avec Maëlys', availableFor: ['lucas', 'sarah', 'yanis', 'ines'] },
    ],
  },
  {
    id: 'scene_03_first_exchanges',
    index: 3,
    title: 'Les premières tensions',
    time: '19h30 – 20h15',
    narrativeBlocks: {
      default: 'L\'apéritif est servi. Les premières piques arrivent, glissées dans des phrases anodines. Le groupe se juge sans se parler vraiment.',
      maelys: 'Inès a dit quelque chose que vous ne lui pardonnerez pas. Vous souriez. Votre verre est vide depuis dix minutes.',
      ines: 'Noé est arrivé en retard. Il s\'est excusé deux fois, d\'une façon qui ressemblait à une performance.',
      lucas: 'Vous observez. Maëlys a baissé la voix deux fois depuis le début. Signe qu\'elle parle de quelque chose qu\'elle ne veut pas entendre fort.',
      sarah: 'Vous avez essayé de dire quelque chose de vrai. Les gens ont souri poliment et changé de sujet.',
    },
    choices: [
      { id: 'c3_observe_maelys', verb: 'observer', label: 'Surveiller le comportement de Maëlys', availableFor: ['lucas', 'sarah', 'noe'], flagSet: 'watching_maelys' },
      { id: 'c3_speak_noe', verb: 'parler', label: 'Parler à Noé en aparté', availableFor: ['ines', 'lucas', 'maelys'] },
      { id: 'c3_silent', verb: 'se taire', label: 'Rester en retrait, écouter', availableFor: 'all' },
    ],
  },
  {
    id: 'scene_04_seating',
    index: 4,
    title: 'Le plan de table',
    time: '20h15 – 20h45',
    narrativeBlocks: {
      default: 'Maëlys désigne les places. Pas de cartons, mais ce n\'est pas une suggestion. Quelqu\'un essaie de s\'asseoir ailleurs.',
      maelys: 'Noé s\'assoit au mauvais endroit. Vous le déplacez avec un sourire. Ce sourire vous a coûté quelque chose.',
      yanis: 'Vous proposez d\'inverser deux places pour que le groupe soit plus mélangé. Maëlys dit non avant que vous ayez fini votre phrase.',
      lucas: 'La façon dont Maëlys a replacé Noé — c\'était trop rapide, trop sûr. Comme si elle avait répété.',
    },
    choices: [
      { id: 'c4_clue_c07', verb: 'remarquer', label: 'Remarquer la correction de place', availableFor: 'all', revealsClue: 'C-07' },
      { id: 'c4_swap', verb: 'changer', label: 'Proposer d\'échanger de place', availableFor: ['yanis', 'noe', 'ines'] },
      { id: 'c4_stay', verb: 'rester', label: 'Accepter la place assignée sans rien dire', availableFor: 'all', flagSet: 'accepted_seating' },
    ],
  },
  {
    id: 'scene_05_social_game_1',
    index: 5,
    title: 'Premier jeu de société',
    time: '20h45 – 21h15',
    narrativeBlocks: {
      default: 'Yanis lance un jeu de questions. Ça paraît innocent. Les réponses ne le sont pas.',
      yanis: 'C\'est vous qui avez proposé le jeu. Vous pensiez détendre l\'ambiance. Vous regardez maintenant les visages.',
      maelys: 'Inès répond à une question en vous regardant. Vous ne répondez pas à la vôtre. On attend.',
      sarah: 'Une question vous désigne. Votre réponse est vraie. Personne ne la croit.',
    },
    choices: [
      { id: 'c5_play', verb: 'jouer', label: 'Participer franchement au jeu', availableFor: 'all' },
      { id: 'c5_observe', verb: 'observer', label: 'Observer les réactions des autres', availableFor: ['lucas', 'sarah', 'maelys'], flagSet: 'observed_game' },
      { id: 'c5_deflect', verb: 'dévier', label: 'Détourner une question gênante', availableFor: ['noe', 'ines', 'maelys'] },
    ],
  },
  {
    id: 'scene_06_kitchen_aside',
    index: 6,
    title: 'L\'aparté en cuisine',
    time: '21h15 – 21h35',
    narrativeBlocks: {
      default: 'Maëlys disparaît en cuisine. Quelqu\'un la suit, ou l\'entend depuis le couloir.',
      sarah: 'Vous êtes entrée chercher de l\'eau. Vous avez vu quelque chose derrière la boîte à sel. Vous n\'avez pas su quoi en faire.',
      lucas: 'Vous avez vu son reflet dans le verre du cellier. Elle faisait quelque chose avec les assiettes. Vous n\'êtes pas entré.',
      maelys: 'Vous avez trente secondes. Vous les utilisez.',
    },
    choices: [
      { id: 'c6_clue_c09', verb: 'examiner', label: 'Regarder derrière la boîte à sel', availableFor: ['sarah', 'maelys'], revealsClue: 'C-09' },
      { id: 'c6_clue_c11', verb: 'observer', label: 'Observer le reflet dans la vitre', availableFor: ['lucas'], revealsClue: 'C-11' },
      { id: 'c6_ignore', verb: 'ignorer', label: 'Repartir sans rien dire', availableFor: 'all' },
      { id: 'c6_intervene', verb: 'intervenir', label: 'Entrer en cuisine et interrompre', availableFor: ['lucas', 'yanis', 'noe'], flagSet: 'interrupted_kitchen' },
    ],
  },
  {
    id: 'scene_07_social_game_2',
    index: 7,
    title: 'Deuxième jeu — les accusations',
    time: '21h35 – 21h50',
    narrativeBlocks: {
      default: 'Le deuxième jeu est plus dur. Les mots choisissent des gens. La photo de Yanis existe à 21h47.',
      yanis: 'Vous prenez une photo du groupe à table. Le flash surprend tout le monde. Maëlys sourit. C\'est la première fois de la soirée.',
      ines: 'Une phrase de Noé vous atteint plus que prévu. Vous ne le montrez pas. Vous le montrez quand même.',
      lucas: 'Vous calculez. Qui a dit quoi, dans quel ordre, à quelle heure. Ça ne colle pas encore.',
    },
    choices: [
      { id: 'c7_clue_c19', verb: 'photographier', label: 'Prendre une photo de la table', availableFor: ['yanis'], revealsClue: 'C-19' },
      { id: 'c7_confront', verb: 'confronter', label: 'Relever une incohérence à voix haute', availableFor: ['lucas', 'ines', 'sarah'] },
      { id: 'c7_silent', verb: 'se taire', label: 'Garder l\'observation pour soi', availableFor: 'all', flagSet: 'stayed_silent_game2' },
    ],
  },
  {
    id: 'scene_08_critical_service',
    index: 8,
    title: 'Le service critique',
    time: '21h50 – 22h10',
    narrativeBlocks: {
      default: 'Les assiettes arrivent. Quelqu\'un sert. Une assiette est différente des autres.',
      maelys: 'Vous portez les assiettes. Votre main ne tremble pas. C\'est pire.',
      lucas: 'Vous avez vu la goutte sur le bord. Vous avez pensé que c\'était de la sauce. Vous avez mangé.',
      sarah: 'Votre assiette sent différemment. Vous n\'avez pas mangé le beurre. C\'est pour ça.',
      yanis: 'Vous avez aidé à porter les assiettes. Vous ne saviez pas laquelle était laquelle.',
    },
    choices: [
      { id: 'c8_clue_c15', verb: 'examiner', label: 'Regarder le bord de votre assiette', availableFor: 'all', revealsClue: 'C-15' },
      { id: 'c8_clue_c18', verb: 'chercher', label: 'Remarquer l\'absence du pilulier de Sarah', availableFor: ['lucas', 'maelys'], revealsClue: 'C-18' },
      { id: 'c8_help_service', verb: 'aider', label: 'Aider Maëlys à distribuer les assiettes', availableFor: ['yanis', 'lucas', 'noe'], flagSet: 'helped_service' },
      { id: 'c8_eat', verb: 'manger', label: 'Commencer à manger sans rien remarquer', availableFor: 'all' },
    ],
  },
  {
    id: 'scene_09_incident',
    index: 9,
    title: 'L\'incident',
    time: '22h10 – 22h30',
    narrativeBlocks: {
      default: 'Quelqu\'un ne va pas bien. Le groupe réagit. Ce qui se dit maintenant — et ce qui ne se dit pas — construit le récit de demain.',
      sarah: 'Vous vous souvenez d\'une sensation, puis d\'un vide. Ce que vous pouvez reconstituer, c\'est avant et après. Pas pendant.',
      maelys: 'Vous avez gardé les yeux sur la table. Vos mains sont dans votre dos. Vous attendez de savoir qui va parler en premier.',
      noe: 'Vous avez dit trois choses. Dans cet ordre précis. Vous ne vous souveniez pas avoir choisi les mots.',
      lucas: 'Vous saviez. Depuis le reflet. Vous n\'avez rien dit. Vous êtes le seul à le savoir.',
    },
    choices: [
      { id: 'c9_speak', verb: 'parler', label: 'Dire ce que vous avez vu', availableFor: ['lucas', 'sarah', 'yanis'], flagSet: 'spoke_incident' },
      { id: 'c9_silent', verb: 'se taire', label: 'Ne rien dire, observer comment les autres cadrent l\'événement', availableFor: 'all', flagSet: 'silent_incident' },
      { id: 'c9_clue_c25', verb: 'écouter', label: 'Faire attention à l\'ordre des phrases de Noé', availableFor: 'all', revealsClue: 'C-25' },
    ],
  },
  {
    id: 'scene_10_aftermath',
    index: 10,
    title: 'Les premières versions',
    time: '22h30 – 23h20',
    narrativeBlocks: {
      default: 'Le groupe tente de comprendre. Ou de raconter. Ce n\'est pas la même chose.',
      lucas: 'Vous tenez le vocal. Vous ne l\'avez pas sorti. Vous vous demandez encore si vous avez eu raison.',
      noe: 'Vous avez déjà une version. Elle est presque vraie. Presque.',
      ines: 'Sarah a dit quelque chose que vous avez contredit. Elle avait probablement raison.',
    },
    choices: [
      { id: 'c10_clue_c20', verb: 'révéler', label: 'Sortir le message vocal', availableFor: ['lucas'], revealsClue: 'C-20' },
      { id: 'c10_clue_c14', verb: 'se souvenir', label: 'Se rappeler la phrase en voiture', availableFor: ['sarah'], revealsClue: 'C-14' },
      { id: 'c10_narrative', verb: 'cadrer', label: 'Proposer une version des faits au groupe', availableFor: ['noe', 'maelys', 'ines', 'lucas'] },
      { id: 'c10_listen', verb: 'écouter', label: 'Laisser les autres parler', availableFor: 'all' },
    ],
  },
  {
    id: 'scene_11_reconstruction',
    index: 11,
    title: 'La reconstruction',
    time: '23h20 – fin',
    narrativeBlocks: {
      default: 'La nuit finit. Ce que vous croyez savoir, maintenant — c\'est votre vérité. Pas forcément la sienne.',
      lucas: 'Vous avez tout. La chronologie, le vocal, le reflet. Il manque juste une chose : le courage de le dire.',
      maelys: 'Les gens sont partis. La maison est vide. Vous rangerez demain.',
      sarah: 'Vous avez raconté ce dont vous vous souvenez. Personne n\'a pris de notes.',
    },
    choices: [
      { id: 'c11_clue_c22', verb: 'trouver', label: 'Trouver la page du carnet', availableFor: ['maelys'], revealsClue: 'C-22' },
      { id: 'c11_clue_c23', verb: 'vérifier', label: 'Vérifier le téléphone de Noé', availableFor: ['noe', 'ines'], revealsClue: 'C-23' },
      { id: 'c11_conclude', verb: 'conclure', label: 'Accepter votre version de la soirée', availableFor: 'all', flagSet: 'concluded' },
    ],
  },
]

interface SceneEngineProps {
  runId: string
  playerPov: CharacterId
  initialScene: number
  discoveredClues: string[]
}

export function SceneEngine({ runId, playerPov, initialScene, discoveredClues: initClues }: SceneEngineProps) {
  const router = useRouter()
  const { recordChoice, discoverClue, setFlag, run } = useRunStore()

  const [sceneIndex, setSceneIndex] = useState(Math.max(0, initialScene - 1))
  const [choiceMade, setChoiceMade] = useState<string | null>(null)
  const [clues, setClues] = useState<string[]>(initClues)
  const [showClues, setShowClues] = useState(false)
  const [saving, setSaving] = useState(false)

  const scene = SCENES[sceneIndex]
  if (!scene) return null

  const narrative = scene.narrativeBlocks[playerPov] ?? scene.narrativeBlocks.default

  const availableChoices = scene.choices.filter(
    (c) => c.availableFor === 'all' || (c.availableFor as CharacterId[]).includes(playerPov)
  )

  async function handleChoice(choice: typeof scene.choices[0]) {
    setChoiceMade(choice.id)

    // Appliquer les effets localement
    recordChoice(scene.id, choice.id)
    if (choice.flagSet) setFlag(choice.flagSet, true)
    if (choice.revealsClue && !clues.includes(choice.revealsClue)) {
      discoverClue(choice.revealsClue)
      setClues((prev) => [...prev, choice.revealsClue!])
    }

    // Persister via API
    setSaving(true)
    try {
      await fetch(`/api/run/${runId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentScene: sceneIndex + 1,
          [`sceneChoices.${scene.id}`]: choice.id,
          ...(choice.flagSet ? { [`flags.${choice.flagSet}`]: true } : {}),
          ...(choice.revealsClue ? { discoveredClues: [...clues, choice.revealsClue] } : {}),
        }),
      })
    } catch {
      // fail silently, local state is source of truth
    } finally {
      setSaving(false)
    }
  }

  function handleNext() {
    if (sceneIndex >= SCENES.length - 1) {
      router.push(`/run/${runId}/final`)
      return
    }
    setSceneIndex((i) => i + 1)
    setChoiceMade(null)
  }

  const isLastScene = sceneIndex === SCENES.length - 1

  return (
    <div style={{ width: '100%', maxWidth: 'var(--content-narrow)' }}>

      {/* Barre de progression */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 'var(--space-8)',
      }}>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          color: 'var(--color-text-faint)',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          Scène {scene.index} / {SCENES.length} — {scene.time}
        </p>
        <button
          onClick={() => setShowClues((v) => !v)}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: clues.length > 0 ? 'var(--color-primary)' : 'var(--color-text-faint)',
            textDecoration: 'underline',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
          }}
        >
          {clues.length} indice{clues.length !== 1 ? 's' : ''}
        </button>
      </div>

      {/* Panneau indices (toggle) */}
      {showClues && (
        <div style={{
          marginBottom: 'var(--space-8)',
          padding: 'var(--space-4)',
          background: 'var(--color-surface-offset)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-divider)',
        }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--color-text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 'var(--space-4)',
          }}>Indices découverts</p>
          <CluePanel discoveredClues={clues} />
        </div>
      )}

      {/* Titre de la scène */}
      <h2 style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'var(--text-xl)',
        color: 'var(--color-text)',
        marginBottom: 'var(--space-6)',
        fontWeight: 500,
      }}>
        {scene.title}
      </h2>

      {/* Texte narratif */}
      <p style={{
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-base)',
        color: 'var(--color-text-muted)',
        lineHeight: '1.8',
        marginBottom: 'var(--space-8)',
        whiteSpace: 'pre-wrap',
      }}>
        {narrative}
      </p>

      {/* Choix */}
      {!choiceMade ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {availableChoices.map((choice) => (
            <button
              key={choice.id}
              onClick={() => handleChoice(choice)}
              style={{
                textAlign: 'left',
                padding: 'var(--space-4) var(--space-6)',
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all var(--transition)',
                display: 'flex',
                alignItems: 'baseline',
                gap: 'var(--space-3)',
              }}
            >
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-primary)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                flexShrink: 0,
              }}>
                {choice.verb}
              </span>
              <span style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-sm)',
                color: 'var(--color-text)',
              }}>
                {choice.label}
              </span>
            </button>
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Confirmation du choix */}
          <div style={{
            padding: 'var(--space-4) var(--space-6)',
            background: 'var(--color-primary-highlight)',
            border: '1px solid var(--color-primary)',
            borderRadius: 'var(--radius-md)',
          }}>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--color-text)',
            }}>
              {availableChoices.find(c => c.id === choiceMade)?.label}
            </p>
            {availableChoices.find(c => c.id === choiceMade)?.revealsClue && (
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-primary)',
                marginTop: 'var(--space-2)',
                fontStyle: 'italic',
              }}>
                Indice {availableChoices.find(c => c.id === choiceMade)?.revealsClue} découvert.
              </p>
            )}
          </div>

          <button
            onClick={handleNext}
            disabled={saving}
            style={{
              alignSelf: 'flex-start',
              padding: 'var(--space-3) var(--space-8)',
              background: 'var(--color-primary)',
              color: 'var(--color-text-inverse)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              letterSpacing: '0.04em',
              cursor: saving ? 'wait' : 'pointer',
              transition: 'all var(--transition)',
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? 'Sauvegarde…' : isLastScene ? 'Voir le dénouement →' : 'Scène suivante →'}
          </button>
        </div>
      )}
    </div>
  )
}
