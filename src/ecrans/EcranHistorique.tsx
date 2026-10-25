import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { bilansDesJournees, type BilanDeJournee } from '../calcul/historique'
import { journeeDe, type Journee } from '../calcul/journee'
import { enCentilitres, enHeure, enJournee, enLitres, enNombreDeLitres } from '../format'
import type { Horloge } from '../horloge'
import type { Base } from '../stockage/base'
import { useMaintenant } from './useMaintenant'

interface Props {
  base: Base
  horloge: Horloge
}

/** Les Journées passées et leur bilan ; le détail d'une Journée est en lecture seule. */
export function EcranHistorique({ base, horloge }: Props) {
  const journeeEnCours = journeeDe(useMaintenant(horloge))
  const prisesPassees = useLiveQuery(() => base.prisesAvant(journeeEnCours), [base, journeeEnCours])
  const changementsObjectif = useLiveQuery(() => base.changementsObjectif(), [base])
  const [journeeOuverte, setJourneeOuverte] = useState<Journee | null>(null)

  // undefined tant que la base n'a pas répondu.
  const bilans = prisesPassees && changementsObjectif && bilansDesJournees(prisesPassees, changementsObjectif)
  const bilanOuvert = bilans?.find((bilan) => bilan.journee === journeeOuverte)

  function contenu() {
    if (!bilans) return null
    if (bilanOuvert) return <DetailDeJournee bilan={bilanOuvert} revenir={() => setJourneeOuverte(null)} />
    if (bilans.length === 0) {
      return <p className="text-eau-700 dark:text-eau-300">Aucune Journée passée pour l'instant.</p>
    }
    return (
      <ul aria-label="Journées passées" className="flex flex-col divide-y divide-eau-100 dark:divide-eau-900">
        {bilans.map((bilan) => (
          <li key={bilan.journee}>
            <button
              type="button"
              onClick={() => setJourneeOuverte(bilan.journee)}
              className="flex w-full items-center justify-between py-3 text-left"
            >
              <span className="tabular-nums">{libelleDu(bilan)}</span>
              {bilan.objectifAtteint && (
                <span role="img" aria-label="Objectif atteint" className="text-eau-600 dark:text-eau-300">
                  ✓
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="px-4 pt-4 pb-2">
        <h1 className="text-xl font-semibold">Historique</h1>
      </header>
      <main className="px-4 py-4">{contenu()}</main>
    </div>
  )
}

/** « lun. 12 oct. · 1,00 / 1,50 L » */
function libelleDu(bilan: BilanDeJournee): string {
  return `${enJournee(bilan.journee)} · ${enNombreDeLitres(bilan.buMl)} / ${enLitres(bilan.objectifMl)}`
}

function DetailDeJournee({ bilan, revenir }: { bilan: BilanDeJournee; revenir: () => void }) {
  const titre = enJournee(bilan.journee)

  return (
    <section className="flex flex-col gap-3">
      <button type="button" onClick={revenir} className="self-start text-sm font-medium text-eau-600 dark:text-eau-300">
        Retour
      </button>
      <h2 className="text-lg font-semibold">{libelleDu(bilan)}</h2>
      <ul aria-label={`Prises de ${titre}`} className="flex flex-col divide-y divide-eau-100 dark:divide-eau-900">
        {bilan.prises.map((prise) => (
          <li key={prise.id} className="py-2 tabular-nums">
            {`${enHeure(prise.horodatage)} · ${enCentilitres(prise.formatMl)}`}
          </li>
        ))}
      </ul>
    </section>
  )
}
