import { journeeDe } from '../calcul/journee'
import {
  OBJECTIF_JOURNALIER_MAX_ML,
  OBJECTIF_JOURNALIER_MIN_ML,
  PAS_OBJECTIF_JOURNALIER_ML,
} from '../calcul/objectif'
import { enCentilitres, enLitres } from '../format'
import type { Horloge } from '../horloge'
import type { Base } from '../stockage/base'
import { useObjectifDuJour } from './useObjectifDuJour'

interface Props {
  base: Base
  horloge: Horloge
}

export function EcranReglages({ base, horloge }: Props) {
  const journee = journeeDe(horloge.maintenant())
  const objectifMl = useObjectifDuJour(base, journee)
  if (objectifMl === undefined) return null

  function ajuster(ecartMl: number) {
    void base.ajusterObjectif(journee, ecartMl)
  }

  const classeBouton =
    'size-12 rounded-full bg-eau-600 text-2xl font-semibold text-white shadow disabled:bg-eau-100 disabled:text-eau-300 dark:disabled:bg-eau-900 dark:disabled:text-eau-700'

  return (
    <div className="flex flex-1 flex-col">
      <header className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-semibold">Réglages</h1>
      </header>

      <main className="flex flex-col gap-6 px-4 py-4">
        <section aria-labelledby="titre-objectif" className="flex flex-col items-center gap-3">
          <h2 id="titre-objectif" className="self-start text-sm font-medium text-eau-700 dark:text-eau-300">
            Objectif journalier
          </h2>
          <div className="flex items-center gap-6">
            <button
              type="button"
              aria-label="Diminuer l'objectif"
              disabled={objectifMl <= OBJECTIF_JOURNALIER_MIN_ML}
              onClick={() => ajuster(-PAS_OBJECTIF_JOURNALIER_ML)}
              className={classeBouton}
            >
              −
            </button>
            <output className="w-28 text-center text-3xl font-semibold tabular-nums">{enLitres(objectifMl)}</output>
            <button
              type="button"
              aria-label="Augmenter l'objectif"
              disabled={objectifMl >= OBJECTIF_JOURNALIER_MAX_ML}
              onClick={() => ajuster(PAS_OBJECTIF_JOURNALIER_ML)}
              className={classeBouton}
            >
              +
            </button>
          </div>
          <p className="text-sm text-eau-700 dark:text-eau-300">
            {`De ${enLitres(OBJECTIF_JOURNALIER_MIN_ML)} à ${enLitres(OBJECTIF_JOURNALIER_MAX_ML)}, par pas de ${enCentilitres(PAS_OBJECTIF_JOURNALIER_ML)}. S'applique à partir d'aujourd'hui.`}
          </p>
        </section>
      </main>
    </div>
  )
}
