import { useState, type FormEvent } from 'react'
import type { Prise } from './calcul/journee'
import { enCentilitres, enHeure } from './format'

interface Props {
  prise: Prise
  menuOuvert: boolean
  basculerMenu: () => void
  supprimer: () => void | Promise<void>
  /** Rejette avec un message à afficher si l'heure est refusée. */
  changerHeure: (heure: string) => Promise<void>
}

/** Une Prise de la Journée en cours, avec son menu ⋮. */
export function LignePrise({ prise, menuOuvert, basculerMenu, supprimer, changerHeure }: Props) {
  const heure = enHeure(prise.horodatage)
  const [nouvelleHeure, setNouvelleHeure] = useState<string | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)

  function fermerFormulaire() {
    setNouvelleHeure(null)
    setErreur(null)
  }

  async function enregistrer(evenement: FormEvent) {
    evenement.preventDefault()
    if (nouvelleHeure === null) return
    try {
      await changerHeure(nouvelleHeure)
      fermerFormulaire()
    } catch (raison) {
      setErreur(raison instanceof Error ? raison.message : String(raison))
    }
  }

  return (
    <li className="flex flex-col py-2">
      <div className="flex items-center gap-3">
        <span className="tabular-nums">{heure}</span>
        <span className="flex-1 text-right">{enCentilitres(prise.formatMl)}</span>
        <button
          type="button"
          aria-label={`Options de la Prise de ${heure}`}
          aria-expanded={menuOuvert}
          onClick={() => {
            fermerFormulaire()
            basculerMenu()
          }}
          className="rounded-full px-2 text-xl leading-none text-eau-700 dark:text-eau-300"
        >
          ⋮
        </button>
      </div>

      {menuOuvert && nouvelleHeure === null && (
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setNouvelleHeure(heure)}
            className="rounded-lg bg-eau-100 px-3 py-1 text-sm font-medium text-eau-900 dark:bg-eau-900 dark:text-eau-100"
          >
            Modifier l'heure
          </button>
          <button
            type="button"
            onClick={supprimer}
            className="rounded-lg bg-red-600 px-3 py-1 text-sm font-medium text-white"
          >
            Supprimer
          </button>
        </div>
      )}

      {menuOuvert && nouvelleHeure !== null && (
        <form onSubmit={enregistrer} className="mt-2 flex flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <label className="text-sm" htmlFor={`heure-${prise.id}`}>
              Nouvelle heure
            </label>
            <input
              id={`heure-${prise.id}`}
              type="time"
              required
              value={nouvelleHeure}
              onChange={(evenement) => setNouvelleHeure(evenement.target.value)}
              className="rounded-lg border border-eau-300 bg-transparent px-2 py-1 tabular-nums"
            />
            <button type="submit" className="rounded-lg bg-eau-600 px-3 py-1 text-sm font-medium text-white">
              Enregistrer
            </button>
          </div>
          {erreur && (
            <p role="alert" className="text-sm text-red-600 dark:text-red-400">
              {erreur}
            </p>
          )}
        </form>
      )}
    </li>
  )
}
