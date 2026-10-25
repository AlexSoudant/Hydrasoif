import { FORMATS_DE_VERRE, instantDansJournee, journeeDe, type FormatDeVerreMl } from './journee'

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

/** La Quantité attendue à cet instant, en millilitres. */
export function quantiteAttendue(instant: Date, objectifMl: number): number {
  return partAttendueSelonReferenceDeDemarrage(instant) * objectifMl
}

/** En dessous de ce Retard, en millilitres, on ne relance pas. */
const RETARD_MINIMAL_ML = 125

export interface Rappel {
  quantiteAttendueMl: number
  retardMl: number
  /** Le plus petit Format de verre qui comble le Retard, au plus 50 cl. */
  formatProposeMl: FormatDeVerreMl
}

/**
 * Le Rappel à afficher à cet instant, ou null : Retard inférieur à 12,5 cl, ou Rappel masqué jusqu'à `masqueJusqua`.
 * Une fois l'Objectif journalier atteint, il n'y a plus de Rappel : la Quantité attendue ne dépasse jamais l'objectif.
 */
export function rappelA(
  maintenant: Date,
  buMl: number,
  objectifMl: number,
  masqueJusqua: Date | null = null,
): Rappel | null {
  if (masqueJusqua && maintenant < masqueJusqua) return null
  const quantiteAttendueMl = quantiteAttendue(maintenant, objectifMl)
  const retardMl = quantiteAttendueMl - buMl
  if (retardMl < RETARD_MINIMAL_ML) return null
  const formatProposeMl = FORMATS_DE_VERRE.find((formatMl) => formatMl >= retardMl) ?? FORMATS_DE_VERRE.at(-1)!
  return { quantiteAttendueMl, retardMl, formatProposeMl }
}
