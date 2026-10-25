import type { Horloge } from '../horloge'

/** Une horloge de test qu'on peut avancer ; l'application la relit à chaque minute. */
export function horlogeReglable(depart: Date): Horloge & { regler(instant: Date): void } {
  let instant = new Date(depart)
  return {
    maintenant: () => new Date(instant),
    regler: (nouvelInstant) => {
      instant = new Date(nouvelInstant)
    },
  }
}
