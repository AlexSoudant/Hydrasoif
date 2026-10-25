import { Dexie, type EntityTable } from 'dexie'
import { bornesDe, type FormatDeVerreMl, type Journee, type Prise } from '../calcul/journee'

export class Base extends Dexie {
  prises!: EntityTable<Prise, 'id'>

  constructor(nom: string) {
    super(nom)
    this.version(1).stores({ prises: '++id, horodatage' })
  }

  async ajouterPrise(formatMl: FormatDeVerreMl, instant: Date): Promise<void> {
    await this.prises.add({ formatMl, horodatage: instant.getTime() })
  }

  /** Les Prises de la Journée, de la plus ancienne à la plus récente. */
  async prisesDe(journee: Journee): Promise<Prise[]> {
    const { debut, fin } = bornesDe(journee)
    return this.prises.where('horodatage').between(debut, fin, true, false).sortBy('horodatage')
  }
}

export function creerBase(nom = 'hydrasoif'): Base {
  return new Base(nom)
}
