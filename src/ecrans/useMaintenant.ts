import { useEffect, useState } from 'react'
import type { Horloge } from '../horloge'

const UNE_MINUTE_MS = 60_000

/**
 * L'instant présent, relu au début de chaque minute tant que l'écran est affiché
 * (le passage à 4 h tombe donc à l'heure pile), et dès que l'application revient au premier plan.
 */
export function useMaintenant(horloge: Horloge): Date {
  const [maintenant, setMaintenant] = useState(() => horloge.maintenant())

  useEffect(() => {
    let minuteur: ReturnType<typeof setTimeout>

    function relireALaProchaineMinute() {
      const ecouleDansLaMinute = horloge.maintenant().getTime() % UNE_MINUTE_MS
      minuteur = setTimeout(() => {
        setMaintenant(horloge.maintenant())
        relireALaProchaineMinute()
      }, UNE_MINUTE_MS - ecouleDansLaMinute)
    }

    function relireAuRetour() {
      if (document.visibilityState !== 'visible') return
      setMaintenant(horloge.maintenant())
      clearTimeout(minuteur)
      relireALaProchaineMinute()
    }

    relireALaProchaineMinute()
    document.addEventListener('visibilitychange', relireAuRetour)
    return () => {
      clearTimeout(minuteur)
      document.removeEventListener('visibilitychange', relireAuRetour)
    }
  }, [horloge])

  return maintenant
}
