import type { Journee } from './calcul/journee'

const centilitres = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })
const litres = new Intl.NumberFormat('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const heure = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })
const date = new Intl.DateTimeFormat('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })

/** 125 → « 12,5 cl » */
export function enCentilitres(ml: number): string {
  return `${centilitres.format(ml / 10)} cl`
}

/** 1500 → « 1,50 L » */
export function enLitres(ml: number): string {
  return `${litres.format(ml / 1000)} L`
}

/** « 10:30 » */
export function enHeure(horodatage: number): string {
  return heure.format(horodatage)
}

/** '2026-10-14' → « mer. 14 oct. » */
export function enJournee(journee: Journee): string {
  const [annee, mois, jour] = journee.split('-').map(Number)
  return date.format(new Date(annee, mois - 1, jour))
}
