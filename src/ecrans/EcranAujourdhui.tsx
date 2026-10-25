import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import {
  FORMATS_DE_VERRE,
  instantDansJournee,
  type FormatDeVerreMl,
  journeeDe,
  totalBu,
} from '../calcul/journee'
import { enCentilitres, enJournee } from '../format'
import type { Horloge } from '../horloge'
import type { Base } from '../stockage/base'
import { LignePrise } from './LignePrise'
import { useObjectifDuJour } from './useObjectifDuJour'
import { VerreDeProgression } from './VerreDeProgression'

interface Props {
  base: Base
  horloge: Horloge
}

/** Durée pendant laquelle une Prise qui vient d'être ajoutée peut être annulée. */
const DUREE_ANNULATION_MS = 5_000

interface PriseAjoutee {
  id: number
  formatMl: FormatDeVerreMl
}

export function EcranAujourdhui({ base, horloge }: Props) {
  const journee = journeeDe(horloge.maintenant())
  // undefined tant que la base n'a pas répondu : le verre attend pour ne pas monter depuis 0 à l'ouverture.
  const prisesChargees = useLiveQuery(() => base.prisesDe(journee), [base, journee])
  const prises = prisesChargees ?? []
  const objectifMl = useObjectifDuJour(base, journee)
  const [derniereAjoutee, setDerniereAjoutee] = useState<PriseAjoutee | null>(null)
  const [menuOuvert, setMenuOuvert] = useState<number | null>(null)
  const [numeroDeVague, setNumeroDeVague] = useState(0)

  useEffect(() => {
    if (!derniereAjoutee) return
    const minuteur = setTimeout(() => setDerniereAjoutee(null), DUREE_ANNULATION_MS)
    return () => clearTimeout(minuteur)
  }, [derniereAjoutee])

  async function ajouter(formatMl: FormatDeVerreMl) {
    const id = await base.ajouterPrise(formatMl, horloge.maintenant())
    setDerniereAjoutee({ id, formatMl })
    setNumeroDeVague((numero) => numero + 1)
  }

  /** Utilisé à la fois par « Annuler » et par le menu ⋮. */
  async function supprimer(id: number) {
    setMenuOuvert(null)
    if (derniereAjoutee?.id === id) setDerniereAjoutee(null)
    await base.supprimerPrise(id)
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-baseline justify-between px-4 pt-4 pb-2">
        <h1 className="text-xl font-semibold">Aujourd'hui</h1>
        <p className="text-sm text-eau-700 dark:text-eau-300">{enJournee(journee)}</p>
      </header>

      <main className="flex flex-1 flex-col gap-6 px-4 py-4">
        {prisesChargees && objectifMl !== undefined && (
          <VerreDeProgression buMl={totalBu(prises, journee)} objectifMl={objectifMl} numeroDeVague={numeroDeVague} />
        )}

        <section className="flex flex-col gap-2">
          <h2 id="titre-prises" className="text-sm font-medium text-eau-700 dark:text-eau-300">
            Prises du jour
          </h2>
          <ul aria-labelledby="titre-prises" className="flex flex-col divide-y divide-eau-100 dark:divide-eau-900">
            {prises.map((prise) => (
              <LignePrise
                key={prise.id}
                prise={prise}
                menuOuvert={menuOuvert === prise.id}
                basculerMenu={() => setMenuOuvert(menuOuvert === prise.id ? null : prise.id!)}
                supprimer={() => supprimer(prise.id!)}
                changerHeure={async (heure) => {
                  await base.changerHeure(prise.id!, instantDansJournee(journee, heure), horloge.maintenant())
                  setMenuOuvert(null)
                }}
              />
            ))}
          </ul>
        </section>
      </main>

      <footer className="sticky bottom-16 grid grid-cols-3 gap-3 bg-eau-50 px-4 py-2 dark:bg-eau-950">
        <div role="status" className="col-span-3 empty:hidden">
          {derniereAjoutee && (
            <p className="flex items-center gap-2 rounded-xl bg-eau-900 px-4 py-2 text-eau-50 dark:bg-eau-100 dark:text-eau-950">
              {`Prise de ${enCentilitres(derniereAjoutee.formatMl)} ajoutée · `}
              <button
                type="button"
                onClick={() => supprimer(derniereAjoutee.id)}
                className="font-semibold underline"
              >
                Annuler
              </button>
            </p>
          )}
        </div>
        {FORMATS_DE_VERRE.map((formatMl) => (
          <button
            key={formatMl}
            type="button"
            onClick={() => ajouter(formatMl)}
            className="rounded-2xl bg-eau-600 py-5 text-lg font-semibold text-white shadow active:bg-eau-700"
          >
            {enCentilitres(formatMl)}
          </button>
        ))}
      </footer>
    </div>
  )
}
