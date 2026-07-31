// Ce que chaque personnage fait concrètement, chapitre par chapitre — pas
// une humeur générique ("ça va"), mais une action précise ancrée dans son
// propre bloc narratif (data/scenes.json). C'est le principe du jeu : au
// même instant, Yanis regarde une photo dans le couloir pendant que Maëlys
// prépare le service en cuisine — deux scènes différentes de la même
// soirée. La variante "tense" s'affiche une fois que la tension accumulée
// dans la partie dépasse un seuil : même action, posture différente.
import type { CharacterId } from '@/lib/types/characters'

interface ActionLine {
  calm: string
  tense: string
}

const TENSE_THRESHOLD = 40

const CHAPTER_ACTIONS: Record<number, Record<CharacterId, ActionLine>> = {
  1: {
    maelys: {
      calm: 'Elle sourit à l’entrée, comme si cette maison portait vraiment son nom.',
      tense: 'Elle sourit à l’entrée, mais revérifie la cuisine une fois de trop avant que la sonnette ne sonne.',
    },
    noe: {
      calm: 'Il repense, dans la voiture, au jour où il a signé seul pour la maison.',
      tense: 'Il est encore dans sa voiture, en retard, à répéter une phrase qu’il regrettera d’avoir dite.',
    },
    ines: {
      calm: 'Elle arrive avec cinq minutes de retard et une bouteille, décidée à ne pas se laisser faire ce soir.',
      tense: 'Elle arrive tendue, la dernière humiliation publique de Maëlys encore en tête.',
    },
    lucas: {
      calm: 'Il n’a pas effacé le vocal dans son téléphone. Il ne sait pas encore pourquoi il est venu ce soir.',
      tense: 'Il observe déjà depuis le seuil, sur ses gardes, avant même d’être entré.',
    },
    sarah: {
      calm: 'Elle espère juste que cette soirée se passe bien, pour une fois.',
      tense: 'Elle recompte, dans sa tête, si elle a vraiment pris son traitement ce matin.',
    },
    yanis: {
      calm: 'Il s’arrête devant l’unique photo du couloir, un peu trop longtemps.',
      tense: 'Il s’arrête devant la photo du couloir, mal à l’aise sans savoir dire pourquoi.',
    },
  },
  2: {
    maelys: {
      calm: 'Elle indique les places d’un sourire, avec des suggestions qui n’en sont pas vraiment.',
      tense: 'Elle corrige la place de Noé sans hausser le ton — un détail qu’elle ne peut pas s’expliquer elle-même.',
    },
    noe: {
      calm: 'Il s’assoit où ça lui semble logique, sans vraiment regarder les cartons.',
      tense: 'Il vérifie, une nouvelle fois depuis la terrasse, que le fil de messages avec Sarah est bien supprimé.',
    },
    ines: {
      calm: 'Elle observe Maëlys aller et venir vers la cuisine avec cette précision qu’elle lui a toujours connue.',
      tense: 'Elle regarde Maëlys scénographier jusqu’au moindre détail, et ça ne la rassure plus du tout.',
    },
    lucas: {
      calm: 'Il mémorise les positions autour de la table, sans savoir encore pourquoi ça compte.',
      tense: 'Il a vu un reflet dans la vitre du cellier qu’il n’arrive pas à effacer de sa tête.',
    },
    sarah: {
      calm: 'Elle perd un jeu sans conséquence et se porte volontaire pour aider au service, contente d’avoir un rôle.',
      tense: 'Elle sent quelque chose de tendu dans la maison, sans pouvoir dire quoi, et se ressert un verre.',
    },
    yanis: {
      calm: 'Il propose un jeu pour détendre l’ambiance, et sert large comme toujours.',
      tense: 'Il prend des photos pour garder la soirée légère, sans remarquer ce qui se passe en cuisine.',
    },
  },
  3: {
    maelys: {
      calm: 'Elle amplifie subtilement une pique d’Inès, sans lever les yeux de son assiette.',
      tense: 'Elle a une seconde et demie pour dire quelque chose, au moment du service. Elle ne dit rien.',
    },
    noe: {
      calm: 'Il regarde son verre pendant qu’Inès corrige Sarah sur une date, sans intervenir.',
      tense: 'Il complimente la sauce, sans savoir que c’est la dernière chose à dire ce soir-là.',
    },
    ines: {
      calm: 'Elle corrige Sarah sur une date, chiffres à l’appui — et le silence qui suit la met mal à l’aise.',
      tense: 'Elle mange à peine, encore sur les nerfs d’une phrase qu’elle regrette déjà d’avoir dite.',
    },
    lucas: {
      calm: 'Il regarde le nouveau plan de table se dessiner, et mémorise qui est passé où.',
      tense: 'Il voit converger tout ce qu’il a observé depuis le début de la soirée. Et il ne dit rien.',
    },
    sarah: {
      calm: 'Elle se retrouve face au passe après l’échange de places, et réfléchit déjà à comment se rendre utile.',
      tense: 'Elle sert les assiettes dans l’ordre du passe, un geste qu’elle fait depuis toujours, sans se douter de rien.',
    },
    yanis: {
      calm: 'Il prend une photo de la table, pour garder une trace d’une soirée qui, espère-t-il, se passe bien.',
      tense: 'Il papote pendant que les assiettes circulent, sans regarder qui reçoit quoi.',
    },
  },
  4: {
    maelys: {
      calm: 'Elle monte à l’étage, seule, et arrache une page d’un carnet avant de jeter le reste au feu.',
      tense: 'Elle s’appuie contre le mur du couloir et laisse Noé construire, phrase après phrase, une version qui tient debout.',
    },
    noe: {
      calm: 'Il prend la parole en premier — trois phrases vraies, dans un ordre qui ne l’est plus tout à fait.',
      tense: 'Il part parmi les derniers, pas certain lui-même de croire à la version qu’il vient de construire.',
    },
    ines: {
      calm: 'Elle s’accroche à la version de Noé, parce que l’alternative est trop lourde à porter ce soir.',
      tense: 'Elle repense une seconde à la photo du couloir, avant de remonter en voiture sans se retourner.',
    },
    lucas: {
      calm: 'Il a tout vu, ce soir. Il écoute le récit se construire, et il ne l’interrompt pas.',
      tense: 'En partant, il repasse devant la photo du couloir et se demande si elle était déjà là avant ce soir.',
    },
    sarah: {
      calm: 'Elle n’est déjà plus vraiment dans la pièce. Personne ne demande ce qu’elle, elle aurait dit.',
      tense: 'Il lui reste une dernière phrase, quelque part, sur l’ordre exact des choses — la seule qu’elle n’a jamais réussi à tenir droite.',
    },
    yanis: {
      calm: 'Il repense à la photo qu’il a prise à 21h47 — un souvenir de soirée, pense-t-il encore.',
      tense: 'Il part sans vraiment comprendre ce qui vient de se passer, ni ce qu’il y a contribué.',
    },
  },
}

export function getCharacterAction(character: CharacterId, chapterNumber: number, tension: number): string {
  const chapter = CHAPTER_ACTIONS[chapterNumber] ?? CHAPTER_ACTIONS[1]
  const line = chapter[character]
  return tension >= TENSE_THRESHOLD ? line.tense : line.calm
}
