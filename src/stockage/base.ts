import { Dexie, type EntityTable } from 'dexie'
import {
  bornesDe,
  HEURE_DE_COUPURE,
  instantDePriseAutorise,
  journeeDe,
  type FormatDeVerreMl,
  type Journee,
  type Prise,
} from '../calcul/journee'

const DEBUT_DE_JOURNEE = `${String(HEURE_DE_COUPURE).padStart(2, '0')}:00`

export class HeureDePriseRefusee extends Error {
  constructor() {
    super(`L'heure doit être comprise entre ${DEBUT_DE_JOURNEE} et maintenant.`)
  }
}

export class PriseNonModifiable extends Error {
  constructor() {
    super('Seules les Prises de la Journée en cours peuvent être modifiées.')
  }
}

export class Base extends Dexie {
  prises!: EntityTable<Prise, 'id'>

  constructor(nom: string) {
    super(nom)
    this.version(1).stores({ prises: '++id, horodatage' })
  }

  /** Enregistre une Prise et renvoie son identifiant. */
  async ajouterPrise(formatMl: FormatDeVerreMl, instant: Date): Promise<number> {
    // Avec ++id, Dexie attribue toujours un identifiant.
    return (await this.prises.add({ formatMl, horodatage: instant.getTime() })) as number
  }

  async supprimerPrise(id: number): Promise<void> {
    await this.prises.delete(id)
  }

  /** Déplace une Prise à un autre instant de la Journée en cours, sans aller dans le futur. */
  async changerHeure(id: number, instant: Date, maintenant: Date): Promise<void> {
    if (!instantDePriseAutorise(instant, maintenant)) throw new HeureDePriseRefusee()
    await this.transaction('rw', this.prises, async () => {
      const prise = await this.prises.get(id)
      if (!prise || journeeDe(new Date(prise.horodatage)) !== journeeDe(maintenant)) {
        throw new PriseNonModifiable()
      }
      await this.prises.update(id, { horodatage: instant.getTime() })
    })
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
