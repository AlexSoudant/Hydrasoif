import { useState } from 'react'
import { EcranAujourdhui } from './ecrans/EcranAujourdhui'
import { EcranHistorique } from './ecrans/EcranHistorique'
import { EcranReglages } from './ecrans/EcranReglages'
import type { Horloge } from './horloge'
import type { Base } from './stockage/base'

interface Props {
  base: Base
  horloge: Horloge
}

const ECRANS = [
  { nom: "Aujourd'hui", icone: '💧', Composant: EcranAujourdhui },
  { nom: 'Historique', icone: '📅', Composant: EcranHistorique },
  { nom: 'Réglages', icone: '⚙️', Composant: EcranReglages },
] as const

type NomEcran = (typeof ECRANS)[number]['nom']

export default function App({ base, horloge }: Props) {
  const [ecran, setEcran] = useState<NomEcran>("Aujourd'hui")
  const { Composant } = ECRANS.find(({ nom }) => nom === ecran)!

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col bg-eau-50 text-eau-950 dark:bg-eau-950 dark:text-eau-50">
      <Composant base={base} horloge={horloge} />
      <nav className="sticky bottom-0 grid h-16 grid-cols-3 border-t border-eau-100 bg-eau-50 dark:border-eau-900 dark:bg-eau-950">
        {ECRANS.map(({ nom, icone }) => (
          <button
            key={nom}
            type="button"
            aria-current={ecran === nom ? 'page' : undefined}
            onClick={() => setEcran(nom)}
            className="flex flex-col items-center justify-center text-xs text-eau-700 aria-[current=page]:font-semibold aria-[current=page]:text-eau-600 dark:text-eau-300 dark:aria-[current=page]:text-eau-100"
          >
            <span aria-hidden="true" className="text-lg">
              {icone}
            </span>
            {nom}
          </button>
        ))}
      </nav>
    </div>
  )
}
