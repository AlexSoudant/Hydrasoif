import { useLiveQuery } from 'dexie-react-hooks'
import {
  FORMATS_DE_VERRE,
  journeeDe,
  OBJECTIF_JOURNALIER_PAR_DEFAUT_ML,
  totalBu,
} from './calcul/journee'
import { enCentilitres, enJournee, enHeure, enLitres } from './format'
import type { Horloge } from './horloge'
import type { Base } from './stockage/base'

interface Props {
  base: Base
  horloge: Horloge
}

export default function App({ base, horloge }: Props) {
  const journee = journeeDe(horloge.maintenant())
  const prises = useLiveQuery(() => base.prisesDe(journee), [base, journee]) ?? []

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-eau-50 text-eau-950 dark:bg-eau-950 dark:text-eau-50">
      <header className="flex items-baseline justify-between px-4 pt-4 pb-2">
        <h1 className="text-xl font-semibold">Aujourd'hui</h1>
        <p className="text-sm text-eau-700 dark:text-eau-300">{enJournee(journee)}</p>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-4 py-4">
        <p className="text-center text-3xl font-semibold">
          {`${enCentilitres(totalBu(prises, journee))} / ${enLitres(OBJECTIF_JOURNALIER_PAR_DEFAUT_ML)}`}
        </p>

        <section className="flex flex-col gap-2">
          <h2 id="titre-prises" className="text-sm font-medium text-eau-700 dark:text-eau-300">
            Prises du jour
          </h2>
          <ul aria-labelledby="titre-prises" className="flex flex-col divide-y divide-eau-100 dark:divide-eau-900">
            {prises.map((prise) => (
              <li key={prise.id} className="flex justify-between py-2">
                <span className="tabular-nums">{enHeure(prise.horodatage)}</span>
                <span>{enCentilitres(prise.formatMl)}</span>
              </li>
            ))}
          </ul>
        </section>
      </main>

      <footer className="sticky bottom-0 grid grid-cols-3 gap-3 bg-eau-50 px-4 pt-2 pb-6 dark:bg-eau-950">
        {FORMATS_DE_VERRE.map((formatMl) => (
          <button
            key={formatMl}
            type="button"
            onClick={() => base.ajouterPrise(formatMl, horloge.maintenant())}
            className="rounded-2xl bg-eau-600 py-5 text-lg font-semibold text-white shadow active:bg-eau-700"
          >
            {enCentilitres(formatMl)}
          </button>
        ))}
      </footer>
    </div>
  )
}
