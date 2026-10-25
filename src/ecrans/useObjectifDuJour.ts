import { useLiveQuery } from 'dexie-react-hooks'
import type { Journee } from '../calcul/journee'
import { objectifDe } from '../calcul/objectif'
import type { Base } from '../stockage/base'

/** L'Objectif journalier de la Journée, en millilitres ; `undefined` tant que la base n'a pas répondu. */
export function useObjectifDuJour(base: Base, journee: Journee): number | undefined {
  const changements = useLiveQuery(() => base.changementsObjectif(), [base])
  return changements && objectifDe(journee, changements)
}
