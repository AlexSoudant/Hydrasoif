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

/** L'instant local à une heure donnée, `decalageJours` jours après la date de début de la Journée. */
function instantLocal(journee: Journee, decalageJours: number, heures: number, minutes = 0): Date {
  const [annee, mois, jour] = journee.split('-').map(Number)
  return new Date(annee, mois - 1, jour + decalageJours, heures, minutes)
}

/** Vrai si le texte est une Journée existante au format AAAA-MM-JJ (pas de 2026-13-45). */
export function estJournee(texte: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texte)) return false
  const [annee, mois, jour] = texte.split('-').map(Number)
  const date = new Date(annee, mois - 1, jour)
  return date.getFullYear() === annee && date.getMonth() === mois - 1 && date.getDate() === jour
}

/** Premier et dernier instants (exclu) de la Journée, en millisecondes depuis l'époque Unix. */
export function bornesDe(journee: Journee): { debut: number; fin: number } {
  return {
    debut: instantLocal(journee, 0, HEURE_DE_COUPURE).getTime(),
    fin: instantLocal(journee, 1, HEURE_DE_COUPURE).getTime(),
  }
}

/** L'instant de la Journée qui correspond à une heure « HH:MM » ; avant 4 h, c'est le lendemain. */
export function instantDansJournee(journee: Journee, heure: string): Date {
  const [heures, minutes] = heure.split(':').map(Number)
  const decalageJours = heures < HEURE_DE_COUPURE ? 1 : 0
  return instantLocal(journee, decalageJours, heures, minutes)
}

/** Une Prise ne peut être placée qu'entre le début de la Journée en cours et maintenant. */
export function instantDePriseAutorise(instant: Date, maintenant: Date): boolean {
  return journeeDe(instant) === journeeDe(maintenant) && instant <= maintenant
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

/** Les Prises rangées par Journée ; seules les Journées qui en comptent au moins une apparaissent. */
export function regrouperParJournee(prises: readonly Prise[]): Map<Journee, Prise[]> {
  const parJournee = new Map<Journee, Prise[]>()
  for (const prise of prises) {
    const journee = journeeDe(new Date(prise.horodatage))
    const prisesDeLaJournee = parJournee.get(journee)
    if (prisesDeLaJournee) prisesDeLaJournee.push(prise)
    else parJournee.set(journee, [prise])
  }
  return parJournee
}

/** La quantité totale de ces Prises, en millilitres. */
export function sommeDes(prises: readonly Prise[]): number {
  return prises.reduce((total, prise) => total + prise.formatMl, 0)
}

/** Ce qui a été bu pendant la Journée, en millilitres. */
export function totalBu(prises: readonly Prise[], journee: Journee): number {
  return sommeDes(prises.filter((prise) => journeeDe(new Date(prise.horodatage)) === journee))
}

/** Minutes écoulées depuis le début de la Journée (4 h), à l'heure locale : 0 à 4 h, 1439 à 3 h 59. */
export function minuteDeJournee(instant: Date): number {
  const minutesDepuisMinuit = instant.getHours() * 60 + instant.getMinutes()
  return (minutesDepuisMinuit - HEURE_DE_COUPURE * 60 + 24 * 60) % (24 * 60)
}

