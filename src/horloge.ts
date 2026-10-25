/** Source unique de l'instant présent, remplaçable dans les tests. */
export interface Horloge {
  maintenant(): Date
}

export const horlogeSysteme: Horloge = {
  maintenant: () => new Date(),
}

export function horlogeFixe(instant: Date): Horloge {
  return { maintenant: () => new Date(instant) }
}
