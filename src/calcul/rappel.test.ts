import { describe, expect, it } from 'vitest'
import type { FormatDeVerreMl, Prise } from './journee'
import { quantiteAttendue, rappelA } from './rappel'

const le14a = (heures: number, minutes = 0) => new Date(2026, 9, 14, heures, minutes)

describe('quantiteAttendue avec la référence de démarrage', () => {
  it('vaut 0 avant 8 h', () => {
    expect(quantiteAttendue(le14a(4, 0), 1500)).toBe(0)
    expect(quantiteAttendue(le14a(7, 59), 1500)).toBe(0)
  })

  it("répartit l'Objectif journalier de façon égale entre 8 h et 22 h", () => {
    expect(quantiteAttendue(le14a(15, 0), 1500)).toBe(750)
    expect(quantiteAttendue(le14a(15, 0), 2000)).toBe(1000)
    expect(quantiteAttendue(le14a(9, 24), 1400)).toBe(140)
  })

  it("vaut tout l'objectif après 22 h, y compris après minuit dans la même Journée", () => {
    expect(quantiteAttendue(le14a(22, 0), 1500)).toBe(1500)
    expect(quantiteAttendue(le14a(23, 30), 1500)).toBe(1500)
    expect(quantiteAttendue(new Date(2026, 9, 15, 1, 0), 1500)).toBe(1500)
  })
})

describe('rappelA', () => {
  // À 15 h avec 1,5 L d'objectif, la Quantité attendue est de 750 ml.
  const quinzeHeures = le14a(15, 0)

  it("n'affiche aucun Rappel en dessous de 12,5 cl de Retard", () => {
    expect(rappelA({ maintenant: quinzeHeures, buMl: 626, objectifMl: 1500 })).toBeNull()
    expect(rappelA({ maintenant: quinzeHeures, buMl: 800, objectifMl: 1500 })).toBeNull()
  })

  it('affiche un Rappel dès 12,5 cl de Retard, avec la Quantité attendue et le Retard', () => {
    expect(rappelA({ maintenant: quinzeHeures, buMl: 625, objectifMl: 1500 })).toEqual({
      quantiteAttendueMl: 750,
      retardMl: 125,
      formatProposeMl: 125,
    })
  })

  it('propose le plus petit Format de verre qui comble le Retard', () => {
    expect(rappelA({ maintenant: quinzeHeures, buMl: 550, objectifMl: 1500 })?.formatProposeMl).toBe(250)
    expect(rappelA({ maintenant: quinzeHeures, buMl: 500, objectifMl: 1500 })?.formatProposeMl).toBe(250)
    expect(rappelA({ maintenant: quinzeHeures, buMl: 400, objectifMl: 1500 })?.formatProposeMl).toBe(500)
  })

  it('propose au plus 50 cl, même pour un Retard plus grand', () => {
    expect(rappelA({ maintenant: quinzeHeures, buMl: 0, objectifMl: 1500 })).toEqual({
      quantiteAttendueMl: 750,
      retardMl: 750,
      formatProposeMl: 500,
    })
  })

  it("suit l'Objectif journalier du jour", () => {
    expect(rappelA({ maintenant: quinzeHeures, buMl: 700, objectifMl: 1500 })).toBeNull()
    expect(rappelA({ maintenant: quinzeHeures, buMl: 700, objectifMl: 2000 })?.retardMl).toBe(300)
  })
})

describe('rappelA, Rappel masqué et Objectif journalier atteint', () => {
  const quinzeHeures = le14a(15, 0)

  it("n'affiche pas un Rappel masqué jusqu'à la fin du masquage", () => {
    expect(rappelA({ maintenant: quinzeHeures, buMl: 0, objectifMl: 1500, masqueJusqua: le14a(15, 1) })).toBeNull()
  })

  it('réaffiche le Rappel une fois le masquage terminé', () => {
    expect(rappelA({ maintenant: quinzeHeures, buMl: 0, objectifMl: 1500, masqueJusqua: le14a(15, 0) })?.retardMl).toBe(750)
    expect(rappelA({ maintenant: quinzeHeures, buMl: 0, objectifMl: 1500, masqueJusqua: le14a(14, 30) })?.retardMl).toBe(750)
  })

  it("n'affiche plus de Rappel une fois l'Objectif journalier atteint", () => {
    expect(rappelA({ maintenant: le14a(23, 0), buMl: 1500, objectifMl: 1500 })).toBeNull()
    expect(rappelA({ maintenant: le14a(23, 0), buMl: 1750, objectifMl: 1500 })).toBeNull()
  })
})

describe('quantiteAttendue avec le Rythme habituel', () => {
  /** Une Prise le `jour` d'octobre 2026 à cette heure. */
  const prise = (jour: number, heures: number, minutes: number, formatMl: FormatDeVerreMl): Prise => ({
    formatMl,
    horodatage: new Date(2026, 9, jour, heures, minutes).getTime(),
  })
  /** Une Journée où la moitié de l'eau est bue avant 11 h : 50 cl à 9 h, 50 cl à 13 h. */
  const moitieAvant11h = (jour: number) => [prise(jour, 9, 0, 500), prise(jour, 13, 0, 500)]
  const onzeHeures = le14a(11, 0)

  it('garde la Référence de démarrage avec moins de 3 Journées utilisables', () => {
    const prisesPassees = [...moitieAvant11h(12), ...moitieAvant11h(13)]
    // Référence de démarrage à 11 h : 3/14 de 1,5 L.
    expect(quantiteAttendue(onzeHeures, 1500, prisesPassees)).toBeCloseTo((3 / 14) * 1500)
  })

  it("passe au Rythme habituel à partir de 3 Journées utilisables", () => {
    const prisesPassees = [...moitieAvant11h(11), ...moitieAvant11h(12), ...moitieAvant11h(13)]
    expect(quantiteAttendue(onzeHeures, 1500, prisesPassees)).toBe(750)
  })

  it("applique le Rythme habituel à l'Objectif journalier du jour", () => {
    const prisesPassees = [...moitieAvant11h(11), ...moitieAvant11h(12), ...moitieAvant11h(13)]
    expect(quantiteAttendue(onzeHeures, 2000, prisesPassees)).toBe(1000)
  })

  it('garde la Référence de démarrage avec une seule Journée utilisable', () => {
    expect(quantiteAttendue(onzeHeures, 1500, moitieAvant11h(13))).toBeCloseTo((3 / 14) * 1500)
  })

  it('ignore les Journées sans Prise, même au-delà de 14 jours calendaires', () => {
    // Le 1er et le 20 septembre, puis le 13 octobre : 3 Journées utilisables, étalées sur plus de 14 jours.
    const prisesPassees = [...moitieAvant11h(-29), ...moitieAvant11h(-10), ...moitieAvant11h(13)]
    expect(quantiteAttendue(onzeHeures, 1500, prisesPassees)).toBe(750)
  })

  it('ne compte jamais la Journée en cours', () => {
    const prisesPassees = [...moitieAvant11h(12), ...moitieAvant11h(13), prise(14, 9, 0, 500)]
    expect(quantiteAttendue(onzeHeures, 1500, prisesPassees)).toBeCloseTo((3 / 14) * 1500)
  })

  it('ne retient que les 14 dernières Journées utilisables', () => {
    // Du 30 septembre au 13 octobre : 14 Journées à 50 % avant 11 h.
    const quatorzeJournees = Array.from({ length: 14 }, (_, i) => moitieAvant11h(i)).flat()
    // Le 29 septembre, la 15e Journée, tout est bu avant 11 h : elle ferait monter la moyenne.
    const quinzieme = [prise(-1, 9, 0, 500)]
    expect(quantiteAttendue(onzeHeures, 1500, [...quinzieme, ...quatorzeJournees])).toBe(750)
  })

  it('suit le Rythme habituel à la minute près', () => {
    const rythme = (jour: number) => [prise(jour, 9, 0, 250), prise(jour, 11, 20, 250), prise(jour, 15, 0, 500)]
    const prisesPassees = [...rythme(11), ...rythme(12), ...rythme(13)]
    expect(quantiteAttendue(le14a(11, 0), 1000, prisesPassees)).toBe(250)
    expect(quantiteAttendue(le14a(11, 19), 1000, prisesPassees)).toBe(250)
    expect(quantiteAttendue(le14a(11, 20), 1000, prisesPassees)).toBe(500)
    expect(quantiteAttendue(le14a(11, 37), 1000, prisesPassees)).toBe(500)
  })

  it("place les Prises d'après minuit en fin de Journée", () => {
    const tardive = (jour: number) => [prise(jour, 9, 0, 500), prise(jour + 1, 0, 30, 500)]
    const prisesPassees = [...tardive(10), ...tardive(11), ...tardive(12)]
    expect(quantiteAttendue(le14a(23, 0), 1000, prisesPassees)).toBe(500)
    expect(quantiteAttendue(new Date(2026, 9, 15, 1, 0), 1000, prisesPassees)).toBe(1000)
  })
})

