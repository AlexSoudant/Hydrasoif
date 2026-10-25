import type { Rappel } from '../calcul/rappel'
import { enCentilitres, enCentilitresArrondis, enHeureCourte } from '../format'

interface Props {
  rappel: Rappel
  maintenant: Date
  boireLeFormatPropose: () => void
  masquer: () => void
}

/** Signale un Retard et propose de boire pour le rattraper. */
export function CarteRappel({ rappel, maintenant, boireLeFormatPropose, masquer }: Props) {
  const attendu = enCentilitresArrondis(rappel.quantiteAttendueMl)
  const retard = enCentilitresArrondis(rappel.retardMl)

  return (
    <section
      aria-label="Rappel"
      className="flex items-center gap-3 rounded-2xl bg-eau-100 px-4 py-3 text-eau-900 dark:bg-eau-900 dark:text-eau-100"
    >
      <span aria-hidden="true" className="text-2xl">
        ⏰
      </span>
      <p className="flex-1 text-sm">
        {`À ${enHeureCourte(maintenant)} tu as normalement bu ${attendu} ! Reprends un verre de ${retard} pour rester dans la course :)`}
      </p>
      <button
        type="button"
        onClick={boireLeFormatPropose}
        className="shrink-0 rounded-xl bg-eau-600 px-3 py-2 font-semibold text-white shadow active:bg-eau-700"
      >
        {`+ ${enCentilitres(rappel.formatProposeMl)}`}
      </button>
      <button
        type="button"
        aria-label="Masquer le Rappel"
        onClick={masquer}
        className="shrink-0 self-start rounded-full px-1 text-lg leading-none text-eau-700 dark:text-eau-300"
      >
        ✕
      </button>
    </section>
  )
}
