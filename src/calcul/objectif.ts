import type { Journee } from './journee'

/** Objectif journalier appliqué tant qu'aucun n'a été réglé, en millilitres. */
export const OBJECTIF_JOURNALIER_PAR_DEFAUT_ML = 1500
export const OBJECTIF_JOURNALIER_MIN_ML = 1000
export const OBJECTIF_JOURNALIER_MAX_ML = 2000
export const PAS_OBJECTIF_JOURNALIER_ML = 250

/** Un réglage de l'Objectif journalier, qui s'applique à partir de sa Journée. */
export interface ChangementObjectif {
  journee: Journee
  objectifMl: number
}

/** L'Objectif journalier d'une Journée : la dernière valeur fixée au plus tard cette Journée. */
export function objectifDe(journee: Journee, changements: readonly ChangementObjectif[]): number {
  let objectif = OBJECTIF_JOURNALIER_PAR_DEFAUT_ML
  let journeeRetenue: Journee | null = null
  for (const changement of changements) {
    // Le format AAAA-MM-JJ se compare correctement comme une chaîne.
    if (changement.journee <= journee && (journeeRetenue === null || changement.journee > journeeRetenue)) {
      objectif = changement.objectifMl
      journeeRetenue = changement.journee
    }
  }
  return objectif
}

/** Ramène un Objectif journalier entre 1 L et 2 L. */
export function objectifBorne(objectifMl: number): number {
  return Math.min(OBJECTIF_JOURNALIER_MAX_ML, Math.max(OBJECTIF_JOURNALIER_MIN_ML, objectifMl))
}
