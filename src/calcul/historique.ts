import { regrouperParJournee, sommeDes, type Journee, type Prise } from './journee'
import { objectifDe, type ChangementObjectif } from './objectif'

export interface BilanDeJournee {
  journee: Journee
  /** Les Prises de la Journée, de la plus ancienne à la plus récente. */
  prises: Prise[]
  buMl: number
  /** L'Objectif journalier qu'avait cette Journée. */
  objectifMl: number
  objectifAtteint: boolean
}

/** Le bilan de chaque Journée qui compte au moins une Prise, de la plus récente à la plus ancienne. */
export function bilansDesJournees(
  prises: readonly Prise[],
  changementsObjectif: readonly ChangementObjectif[],
): BilanDeJournee[] {
  return [...regrouperParJournee(prises)]
    .map(([journee, prisesDeLaJournee]) => {
      const buMl = sommeDes(prisesDeLaJournee)
      const objectifMl = objectifDe(journee, changementsObjectif)
      return {
        journee,
        prises: prisesDeLaJournee.toSorted((a, b) => a.horodatage - b.horodatage),
        buMl,
        objectifMl,
        objectifAtteint: buMl >= objectifMl,
      }
    })
    .sort((a, b) => (a.journee < b.journee ? 1 : -1))
}
