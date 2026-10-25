import { estJournee, FORMATS_DE_VERRE, type Prise } from '../calcul/journee'
import {
  OBJECTIF_JOURNALIER_MAX_ML,
  OBJECTIF_JOURNALIER_MIN_ML,
  PAS_OBJECTIF_JOURNALIER_ML,
  type ChangementObjectif,
} from '../calcul/objectif'

/** Version du format de fichier : à augmenter si sa structure change. */
export const VERSION_DE_SAUVEGARDE = 1

/** Une Prise telle qu'elle est écrite dans le fichier : sans son identifiant, réattribué à l'import. */
export type PriseSauvegardee = Omit<Prise, 'id'>

/** Le contenu d'un fichier d'export : toutes les Prises et tous les changements d'Objectif journalier. */
export interface Sauvegarde {
  version: typeof VERSION_DE_SAUVEGARDE
  prises: PriseSauvegardee[]
  objectifs: ChangementObjectif[]
}

export function sansId({ formatMl, horodatage }: Prise): PriseSauvegardee {
  return { formatMl, horodatage }
}

export class SauvegardeInvalide extends Error {
  constructor(raison: string) {
    super(`Ce fichier n'est pas une sauvegarde Hydrasoif valide : ${raison}.`)
  }
}

/** Lit et vérifie le texte d'un fichier d'export ; lève SauvegardeInvalide au moindre écart. */
export function lireSauvegarde(texte: string): Sauvegarde {
  let donnees: unknown
  try {
    donnees = JSON.parse(texte)
  } catch {
    throw new SauvegardeInvalide("il n'est pas lisible")
  }

  if (!estObjet(donnees)) throw new SauvegardeInvalide('structure inattendue')
  if (donnees.version !== VERSION_DE_SAUVEGARDE) {
    throw new SauvegardeInvalide(`version ${String(donnees.version)} inconnue`)
  }
  const { prises, objectifs } = donnees
  if (!Array.isArray(prises) || !prises.every(estPrise)) throw new SauvegardeInvalide('Prises incorrectes')
  if (!Array.isArray(objectifs) || !objectifs.every(estChangementObjectif)) {
    throw new SauvegardeInvalide('Objectifs journaliers incorrects')
  }
  if (new Set(objectifs.map(({ journee }) => journee)).size !== objectifs.length) {
    throw new SauvegardeInvalide('plusieurs Objectifs journaliers pour une même Journée')
  }

  return {
    version: VERSION_DE_SAUVEGARDE,
    prises: prises.map(sansId),
    objectifs: objectifs.map(({ journee, objectifMl }) => ({ journee, objectifMl })),
  }
}

function estObjet(valeur: unknown): valeur is Record<string, unknown> {
  return typeof valeur === 'object' && valeur !== null && !Array.isArray(valeur)
}

function estPrise(valeur: unknown): valeur is PriseSauvegardee {
  return (
    estObjet(valeur) &&
    (FORMATS_DE_VERRE as readonly unknown[]).includes(valeur.formatMl) &&
    Number.isSafeInteger(valeur.horodatage) &&
    (valeur.horodatage as number) > 0
  )
}

function estChangementObjectif(valeur: unknown): valeur is ChangementObjectif {
  return (
    estObjet(valeur) &&
    typeof valeur.journee === 'string' &&
    estJournee(valeur.journee) &&
    Number.isInteger(valeur.objectifMl) &&
    (valeur.objectifMl as number) >= OBJECTIF_JOURNALIER_MIN_ML &&
    (valeur.objectifMl as number) <= OBJECTIF_JOURNALIER_MAX_ML &&
    ((valeur.objectifMl as number) - OBJECTIF_JOURNALIER_MIN_ML) % PAS_OBJECTIF_JOURNALIER_ML === 0
  )
}
