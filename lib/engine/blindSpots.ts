// "Ce qu'il/elle ne peut pas voir" — chapitre 4 de la bible, jamais utilisé
// en jeu jusqu'ici. Affiché en quittant un personnage, avant de choisir le
// suivant : ce que CE personnage n'aura jamais su de cette soirée.
import type { CharacterId } from '@/lib/types/characters'

export const BLIND_SPOTS: Record<CharacterId, string[]> = {
  maelys: [
    "L'image qu'elle renvoie — elle se croit maîtrisée ; les autres la trouvent effrayante dès 20h15.",
    'Que Lucas la regarde depuis le début de la soirée et a déjà compris quelque chose.',
    "Que sa propre chaîne de service lui a échappé à l'instant précis où elle a laissé quelqu'un d'autre porter une assiette.",
    'Sa part d\'intention concernant Sarah — elle ne se la formule pas.',
  ],
  noe: [
    "L'ampleur réelle de ce qu'il a déclenché — il croit avoir été « pas terrible »." ,
    'Les indices matériels — il ne regarde jamais les objets, seulement les visages.',
    "Qu'Inès parle à sa place depuis quatre ans, et que c'est lui qui l'a mise là.",
  ],
  ines: [
    "Qu'elle est en train, phrase après phrase, de désigner sa propre assiette.",
    'Que sa protection de Noé le maintient dans l\'état exact qui a détruit tout le monde.',
    'Que Sarah, qu\'elle méprise, est la seule à avoir raison ce soir.',
  ],
  lucas: [
    'Son propre coût moral — il croit avoir un problème de courage ; il a un problème de complicité.',
    'Ce qui se passe hors de son champ — il compense par la déduction, et il déduit parfois faux avec une grande confiance.',
  ],
  sarah: [
    'La solidité de sa propre reconstruction — elle doute d\'elle en permanence, ce qui la rend inaudible au moment où elle a raison.',
    "Qu'elle est en danger. À aucun moment.",
  ],
  yanis: [
    'Les vraies lignes de faute — il attribue les tensions aux mauvaises personnes, presque systématiquement.',
    'Que ses initiatives ont des effets structurels — il pense influencer l\'ambiance ; il déplace des corps.',
    "Ce qu'il a photographié à 21h47.",
  ],
}
