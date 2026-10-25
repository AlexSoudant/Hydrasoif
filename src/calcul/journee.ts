/** Heure locale à laquelle une Journée commence (et la précédente se termine). */
export const HEURE_DE_COUPURE = 4

/** Identifiant d'une Journée : la date locale de son début, au format AAAA-MM-JJ. */
export type Journee = string

export function journeeDe(instant: Date): Journee {
  const debut = new Date(instant)
  if (debut.getHours() < HEURE_DE_COUPURE) debut.setDate(debut.getDate() - 1)
  const mois = String(debut.getMonth() + 1).padStart(2, '0')
  const jour = String(debut.getDate()).padStart(2, '0')
  return `${debut.getFullYear()}-${mois}-${jour}`
}

/** Premier et dernier instants (exclu) de la Journée, en millisecondes depuis l'époque Unix. */
export function bornesDe(journee: Journee): { debut: number; fin: number } {
  const [annee, mois, jour] = journee.split('-').map(Number)
  return {
    debut: new Date(annee, mois - 1, jour, HEURE_DE_COUPURE).getTime(),
    fin: new Date(annee, mois - 1, jour + 1, HEURE_DE_COUPURE).getTime(),
  }
}

/** Contenances des Formats de verre, en millilitres. */
export const FORMATS_DE_VERRE = [125, 250, 500] as const

export type FormatDeVerreMl = (typeof FORMATS_DE_VERRE)[number]

export interface Prise {
  id?: number
  formatMl: FormatDeVerreMl
  /** Instant de la Prise, en millisecondes depuis l'époque Unix. */
  horodatage: number
}

/** Ce qui a été bu pendant la Journée, en millilitres. */
export function totalBu(prises: readonly Prise[], journee: Journee): number {
  return prises
    .filter((prise) => journeeDe(new Date(prise.horodatage)) === journee)
    .reduce((total, prise) => total + prise.formatMl, 0)
}

/** Objectif journalier appliqué tant qu'aucun n'a été réglé, en millilitres. */
export const OBJECTIF_JOURNALIER_PAR_DEFAUT_ML = 1500
