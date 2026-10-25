import { useState, type ChangeEvent } from 'react'
import type { Journee } from '../calcul/journee'
import type { Base } from '../stockage/base'
import { lireSauvegarde, SauvegardeInvalide, type Sauvegarde } from '../stockage/sauvegarde'

interface Props {
  base: Base
  journee: Journee
}

type Etat =
  | { etape: 'repos' }
  | { etape: 'confirmation'; sauvegarde: Sauvegarde; journeesActuelles: number }
  | { etape: 'importee'; journees: number }
  | { etape: 'refusee'; message: string }

const classeBouton =
  'rounded-xl bg-eau-100 px-4 py-2 text-center font-medium text-eau-900 dark:bg-eau-900 dark:text-eau-100'

/** Export de toutes les données dans un fichier JSON, et import qui les remplace après confirmation. */
export function SectionSauvegarde({ base, journee }: Props) {
  const [etat, setEtat] = useState<Etat>({ etape: 'repos' })

  async function exporter() {
    const sauvegarde = await base.exporter()
    const fichier = new Blob([JSON.stringify(sauvegarde, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(fichier)
    const lien = document.createElement('a')
    lien.href = url
    lien.download = `hydrasoif-${journee}.json`
    // Certains navigateurs ne téléchargent qu'un lien présent dans la page, et lisent l'URL après le clic.
    document.body.append(lien)
    lien.click()
    lien.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1_000)
  }

  async function preparerImport(evenement: ChangeEvent<HTMLInputElement>) {
    const fichier = evenement.target.files?.[0]
    // Permet de choisir à nouveau le même fichier.
    evenement.target.value = ''
    if (!fichier) return
    try {
      const sauvegarde = lireSauvegarde(await fichier.text())
      setEtat({ etape: 'confirmation', sauvegarde, journeesActuelles: await base.nombreDeJournees() })
    } catch (erreur) {
      if (!(erreur instanceof SauvegardeInvalide)) throw erreur
      setEtat({ etape: 'refusee', message: erreur.message })
    }
  }

  async function remplacer(sauvegarde: Sauvegarde) {
    try {
      await base.remplacerPar(sauvegarde)
    } catch {
      // La transaction a été annulée : les données d'avant sont intactes.
      setEtat({ etape: 'refusee', message: "L'import a échoué ; tes données n'ont pas été modifiées." })
      return
    }
    setEtat({ etape: 'importee', journees: await base.nombreDeJournees() })
  }

  return (
    <section aria-labelledby="titre-sauvegarde" className="flex flex-col gap-3">
      <h2 id="titre-sauvegarde" className="text-sm font-medium text-eau-700 dark:text-eau-300">
        Sauvegarde
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <button type="button" onClick={exporter} className={classeBouton}>
          Exporter
        </button>
        <label
          className={`${classeBouton} cursor-pointer focus-within:ring-2 focus-within:ring-eau-600 dark:focus-within:ring-eau-300`}
        >
          Importer
          <input type="file" accept="application/json,.json" onChange={preparerImport} className="sr-only" />
        </label>
      </div>

      {etat.etape === 'confirmation' && (
        <div
          role="alertdialog"
          aria-labelledby="titre-confirmation"
          className="flex flex-col gap-3 rounded-2xl bg-eau-100 p-4 dark:bg-eau-900"
        >
          <p id="titre-confirmation">{messageDeConfirmation(etat.journeesActuelles)}</p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEtat({ etape: 'repos' })} className="px-3 py-1 font-medium">
              Annuler
            </button>
            <button
              type="button"
              onClick={() => remplacer(etat.sauvegarde)}
              className="rounded-lg bg-red-600 px-3 py-1 font-medium text-white"
            >
              Remplacer
            </button>
          </div>
        </div>
      )}
      {etat.etape === 'importee' && (
        <p role="status" className="text-sm">{`Sauvegarde importée : ${etat.journees} ${etat.journees > 1 ? 'Journées' : 'Journée'}.`}</p>
      )}
      {etat.etape === 'refusee' && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {etat.message}
        </p>
      )}

      <p className="text-sm text-eau-700 dark:text-eau-300">
        Tes données ne sont que sur ce téléphone : exporte-les de temps en temps.
      </p>
    </section>
  )
}

/** Ce que l'import va remplacer, selon le nombre de Journées actuelles. */
function messageDeConfirmation(journeesActuelles: number): string {
  if (journeesActuelles === 0) return "Tu n'as encore aucune Journée : rien ne sera remplacé."
  if (journeesActuelles === 1) return 'Ceci remplacera ta 1 Journée actuelle.'
  return `Ceci remplacera tes ${journeesActuelles} Journées actuelles.`
}
