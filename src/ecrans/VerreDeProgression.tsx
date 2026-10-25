import { useId } from 'react'
import { enCentilitres, enLitres, enNombreDeLitres } from '../format'

interface Props {
  buMl: number
  objectifMl: number
  /** Augmente à chaque Prise enregistrée : relance la vague. 0 : surface calme. */
  numeroDeVague: number
}

// Repère du SVG : ordonnées du bord et du fond du verre, et son tracé.
const Y_BORD = 20
const Y_FOND = 230
const TRACE_DU_VERRE = 'M30 20 L170 20 L152 230 L48 230 Z'

// Surface calme, à y = 4 du groupe d'eau : à 0 %, même les crêtes de la vague restent sous le fond.
// L'animation `vague` (src/index.css) part d'un tracé ondulé aux mêmes commandes et revient à celui-ci.
const SURFACE_DE_L_EAU = 'M0 4 q25 0 50 0 t50 0 t50 0 t50 0 t50 0 t50 0 V240 H0 Z'

/** Un verre d'eau qui se remplit jusqu'à l'Objectif journalier, puis déborde. */
export function VerreDeProgression({ buMl, objectifMl, numeroDeVague }: Props) {
  const idInterieur = useId()
  const atteint = buMl >= objectifMl
  const deborde = buMl > objectifMl
  const remplissage = Math.min(1, buMl / objectifMl)
  // Jamais « 100 % » tant que l'objectif n'est pas vraiment atteint.
  const pourcentage = atteint ? 100 : Math.min(99, Math.round(remplissage * 100))
  const niveau = Y_FOND - remplissage * (Y_FOND - Y_BORD)

  const bu = atteint ? enNombreDeLitres(buMl) : enCentilitres(buMl)
  const libelleQuantites = `${bu} / ${enLitres(objectifMl)}`
  const libelleProgression = deborde ? `+${enCentilitres(buMl - objectifMl)}` : `${pourcentage} %`

  return (
    <div
      role="progressbar"
      aria-label="Eau bue aujourd’hui"
      aria-valuemin={0}
      aria-valuemax={objectifMl}
      aria-valuenow={Math.min(buMl, objectifMl)}
      aria-valuetext={`${libelleQuantites} · ${libelleProgression}`}
      className="relative mx-auto w-48"
    >
      <svg viewBox="0 0 200 240" aria-hidden="true" className="w-full overflow-visible">
        <defs>
          <clipPath id={idInterieur}>
            <path d={TRACE_DU_VERRE} />
          </clipPath>
        </defs>

        <g clipPath={`url(#${idInterieur})`}>
          <g
            style={{ transform: `translateY(${niveau}px)` }}
            className="transition-transform duration-600 ease-out motion-reduce:transition-none"
          >
            {/* Changer de clé recrée le tracé, ce qui relance l'animation. */}
            <path
              key={numeroDeVague}
              d={SURFACE_DE_L_EAU}
              className={`fill-eau-500 dark:fill-eau-600 ${numeroDeVague > 0 ? 'animate-vague motion-reduce:animate-none' : ''}`}
            />
          </g>
        </g>

        <path
          d={TRACE_DU_VERRE}
          className="fill-none stroke-eau-700 stroke-4 dark:stroke-eau-300"
          strokeLinejoin="round"
        />

        {deborde && (
          <g className="fill-eau-500 dark:fill-eau-300">
            <path d="M24 26 q-6 10 0 14 q6 -4 0 -14 Z" />
            <path d="M176 30 q-6 10 0 14 q6 -4 0 -14 Z" />
            <path d="M16 48 q-5 8 0 11 q5 -3 0 -11 Z" />
          </g>
        )}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center [text-shadow:0_0_6px_var(--color-eau-50)] dark:[text-shadow:0_0_6px_var(--color-eau-950)]">
        <span className="text-2xl font-semibold tabular-nums">{libelleQuantites}</span>
        <span className="text-lg tabular-nums">{libelleProgression}</span>
        {atteint && <span className="text-sm font-medium">Objectif atteint, bravo !</span>}
      </div>
    </div>
  )
}
