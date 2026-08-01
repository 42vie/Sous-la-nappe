// Le journal de Lucas — mémoire visible, uniquement pour ce POV
// (docs/expansion-v4-mecanismes-suspense-fins-noires.md, volet A4). Pas
// les indices bruts : des phrases en voix intérieure, courtes,
// subjectives, dans l'ordre chronologique de la soirée. Le joueur peut le
// consulter à tout moment sans que ça influence rien — un clin d'œil
// narratif, pas un mécanisme fonctionnel.
import type { RunState } from '@/types'

interface JournalEntry {
  flag: string
  text: string
}

const ENTRIES: JournalEntry[] = [
  { flag: 'lucas_a_reecouté_vocal', text: "Le vocal, encore. Je ne l'efface pas. Je ne sais toujours pas pourquoi." },
  { flag: 'lucas_note_palier', text: "Elle a testé quelque chose sur moi, dans le couloir, avant même que j'entre." },
  { flag: 'lucas_a_verifie_sarah', text: "J'ai profité d'une tension entre elles pour m'assurer, du regard, que Sarah allait bien." },
  { flag: 'lucas_sait_medicaments', text: "Elle a oublié ses comprimés, ce soir. Je n'ai rien dit." },
  { flag: 'lucas_previent_sarah', text: "Je lui ai dit de rentrer les chercher. Elle n'a pas voulu." },
  { flag: 'lucas_a_note_placement', text: "Elle a corrigé la place de Noé comme si ça comptait vraiment." },
  { flag: 'lucas_a_vu_reflet', text: "Le reflet. Elle penchée. Une seule assiette." },
  { flag: 'lucas_contact_ami_yanis', text: "J'ai appelé l'ami que Yanis remplace ce soir. Il avait peur d'elle. Ce n'était pas une blague." },
  { flag: 'lucas_promet_mais_note', text: "Noé m'a demandé de ne rien répéter. J'ai acquiescé — et j'ai noté quand même." },
  { flag: 'lucas_questionne_noe', text: "Je lui ai demandé « quoi ? ». Il n'a pas vraiment répondu." },
  { flag: 'lucas_a_note_echange_places', text: "Inès et Sarah ont échangé leurs places. Je l'ai vu. Je n'ai rien dit." },
  { flag: 'lucas_temoin_morpion', text: "Sarah a perdu le jeu. Elle va servir, maintenant." },
  { flag: 'lucas_a_interrompu_morpion', text: "J'ai pris sa place. Yanis servira à sa place, pas elle." },
  { flag: 'lucas_temoin_service_silencieux', text: "Le service. L'ordre. Sarah, place 4." },
  { flag: 'lucas_a_interrompu_service', text: "J'ai pris l'assiette avant qu'elle n'arrive jusqu'à elle." },
  { flag: 'lucas_photo_couloir', text: "J'ai pris une photo du couloir, discrètement. Au cas où." },
  { flag: 'samu_appele_tot', text: "J'ai appelé le SAMU tout de suite. Je n'ai pas attendu que quelqu'un d'autre s'en charge." },
  { flag: 'lucas_silence_moral', text: "J'ai laissé le récit se construire sans moi." },
  { flag: 'lucas_a_parle', text: "J'ai dit quelque chose. Pas tout. Mais assez pour que ça compte." },
  { flag: 'lucas_appelle_police', text: "J'ai appelé la police. Il fallait bien que quelqu'un le fasse." },
  { flag: 'lucas_confrontation_finale', text: "Je l'ai confrontée, en tête-à-tête, juste avant de partir." },
  { flag: 'lucas_silence_final', text: "Je suis parti sans un mot. J'avais peut-être tout ce qu'il fallait pour éviter ça." },
]

/** Entrées du journal, dans l'ordre de la soirée — vide si aucune, jamais affiché hors POV Lucas. */
export function buildLucasJournal(state: RunState): string[] {
  return ENTRIES.filter((e) => state.flags[e.flag]).map((e) => e.text)
}
