import {
  FORMATS_DE_VERRE,
  instantDansJournee,
  journeeDe,
  minuteDeJournee,
  regrouperParJournee,
  sommeDes,
  type FormatDeVerreMl,
  type Prise,
} from './journee'

// Référence de démarrage : l'Objectif journalier réparti de façon égale entre ces deux heures.
const DEBUT_DE_LA_REFERENCE = '08:00'
const FIN_DE_LA_REFERENCE = '22:00'

/** Selon la Référence de démarrage, part de l'Objectif journalier qu'on devrait avoir bue à cet instant (entre 0 et 1). */
function partAttendueSelonReferenceDeDemarrage(instant: Date): number {
  const journee = journeeDe(instant)
  const debut = instantDansJournee(journee, DEBUT_DE_LA_REFERENCE).getTime()
  const fin = instantDansJournee(journee, FIN_DE_LA_REFERENCE).getTime()
  const part = (instant.getTime() - debut) / (fin - debut)
  return Math.min(1, Math.max(0, part))
}

/** Le Rythme habituel porte sur ce nombre de Journées passées, au plus. */
const JOURNEES_DU_RYTHME_HABITUEL = 14
/** En dessous, on garde la Référence de démarrage. */
const JOURNEES_MINIMUM_DU_RYTHME_HABITUEL = 3

/**
 * Selon le Rythme habituel, part de l'Objectif journalier qu'on devrait avoir bue à cet instant (entre 0 et 1),
 * ou null s'il y a moins de 3 Journées passées avec au moins une Prise.
 */
function partAttendueSelonRythmeHabituel(instant: Date, prisesPassees: readonly Prise[]): number | null {
  const journeeEnCours = journeeDe(instant)
  const prisesParJournee = regrouperParJournee(prisesPassees)
  // Le format AAAA-MM-JJ se trie correctement comme une chaîne.
  const journeesRetenues = [...prisesParJournee.keys()]
    .filter((journee) => journee < journeeEnCours)
    .sort()
    .slice(-JOURNEES_DU_RYTHME_HABITUEL)
  if (journeesRetenues.length < JOURNEES_MINIMUM_DU_RYTHME_HABITUEL) return null

  const minute = minuteDeJournee(instant)
  const parts = journeesRetenues.map((journee) => {
    const prises = prisesParJournee.get(journee)!
    const dejaBues = prises.filter((prise) => minuteDeJournee(new Date(prise.horodatage)) <= minute)
    return sommeDes(dejaBues) / sommeDes(prises)
  })
  return parts.reduce((somme, part) => somme + part, 0) / parts.length
}

/**
 * La Quantité attendue à cet instant, en millilitres : le Rythme habituel tiré des Prises des Journées passées,
 * ou la Référence de démarrage tant qu'il n'y en a pas assez.
 */
export function quantiteAttendue(instant: Date, objectifMl: number, prisesPassees: readonly Prise[] = []): number {
  const part =
    partAttendueSelonRythmeHabituel(instant, prisesPassees) ?? partAttendueSelonReferenceDeDemarrage(instant)
  return part * objectifMl
}

/** En dessous de ce Retard, en millilitres, on ne relance pas. */
const RETARD_MINIMAL_ML = 125

export interface Rappel {
  quantiteAttendueMl: number
  retardMl: number
  /** Le plus petit Format de verre qui comble le Retard, au plus 50 cl. */
  formatProposeMl: FormatDeVerreMl
}

/** Ce que le calcul du Rappel doit savoir de la Journée en cours. */
export interface DonneesDuRappel {
  maintenant: Date
  /** Ce qui a été bu depuis le début de la Journée en cours, en millilitres. */
  buMl: number
  objectifMl: number
  /** Les Prises des Journées passées, d'où se tire le Rythme habituel. */
  prisesPassees?: readonly Prise[]
  /** Rappel masqué jusqu'à cet instant, s'il l'est. */
  masqueJusqua?: Date | null
}

/**
 * Le Rappel à afficher à cet instant, ou null : Retard inférieur à 12,5 cl, ou Rappel masqué.
 * Une fois l'Objectif journalier atteint, il n'y a plus de Rappel : la Quantité attendue ne dépasse jamais l'objectif.
 */
export function rappelA({ maintenant, buMl, objectifMl, prisesPassees = [], masqueJusqua = null }: DonneesDuRappel): Rappel | null {
  if (masqueJusqua && maintenant < masqueJusqua) return null
  const quantiteAttendueMl = quantiteAttendue(maintenant, objectifMl, prisesPassees)
  const retardMl = quantiteAttendueMl - buMl
  if (retardMl < RETARD_MINIMAL_ML) return null
  const formatProposeMl = FORMATS_DE_VERRE.find((formatMl) => formatMl >= retardMl) ?? FORMATS_DE_VERRE.at(-1)!
  return { quantiteAttendueMl, retardMl, formatProposeMl }
}
