import { Dexie, type EntityTable } from 'dexie'
import {
  bornesDe,
  HEURE_DE_COUPURE,
  instantDePriseAutorise,
  journeeDe,
  regrouperParJournee,
  type FormatDeVerreMl,
  type Journee,
  type Prise,
} from '../calcul/journee'
import { objectifBorne, objectifDe, type ChangementObjectif } from '../calcul/objectif'
import { sansId, VERSION_DE_SAUVEGARDE, type Sauvegarde } from './sauvegarde'

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
  /** Un réglage au plus par Journée : le dernier de la Journée remplace les précédents. */
  objectifs!: EntityTable<ChangementObjectif, 'journee'>

  constructor(nom: string) {
    super(nom)
    this.version(1).stores({ prises: '++id, horodatage' })
    this.version(2).stores({ objectifs: 'journee' })
  }

  /**
   * Augmente ou diminue l'Objectif journalier à partir de la Journée donnée, sans sortir de 1 L–2 L.
   * Lecture et écriture dans la même transaction : deux appuis rapprochés comptent pour deux pas.
   */
  async ajusterObjectif(journee: Journee, ecartMl: number): Promise<void> {
    await this.transaction('rw', this.objectifs, async () => {
      const actuelMl = objectifDe(journee, await this.objectifs.toArray())
      await this.objectifs.put({ journee, objectifMl: objectifBorne(actuelMl + ecartMl) })
    })
  }

  async changementsObjectif(): Promise<ChangementObjectif[]> {
    return this.objectifs.toArray()
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

  /** Toutes les données, pour l'export. */
  async exporter(): Promise<Sauvegarde> {
    return this.transaction('r', this.prises, this.objectifs, async () => ({
      version: VERSION_DE_SAUVEGARDE,
      prises: (await this.prises.orderBy('horodatage').toArray()).map(sansId),
      objectifs: await this.objectifs.toArray(),
    }))
  }

  /** Remplace toutes les données par celles de la sauvegarde, en une seule transaction. */
  async remplacerPar(sauvegarde: Sauvegarde): Promise<void> {
    await this.transaction('rw', this.prises, this.objectifs, async () => {
      await this.prises.clear()
      await this.objectifs.clear()
      await this.prises.bulkAdd(sauvegarde.prises)
      await this.objectifs.bulkAdd(sauvegarde.objectifs)
    })
  }

  /** Le nombre de Journées qui comptent au moins une Prise. */
  async nombreDeJournees(): Promise<number> {
    return regrouperParJournee(await this.prises.toArray()).size
  }

  /** Les Prises des Journées qui précèdent celle-ci (Rythme habituel, Historique). */
  async prisesAvant(journee: Journee): Promise<Prise[]> {
    return this.prises.where('horodatage').below(bornesDe(journee).debut).toArray()
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
