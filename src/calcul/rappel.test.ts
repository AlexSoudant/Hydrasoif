import { describe, expect, it } from 'vitest'
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
    expect(rappelA(quinzeHeures, 626, 1500)).toBeNull()
    expect(rappelA(quinzeHeures, 800, 1500)).toBeNull()
  })

  it('affiche un Rappel dès 12,5 cl de Retard, avec la Quantité attendue et le Retard', () => {
    expect(rappelA(quinzeHeures, 625, 1500)).toEqual({
      quantiteAttendueMl: 750,
      retardMl: 125,
      formatProposeMl: 125,
    })
  })

  it('propose le plus petit Format de verre qui comble le Retard', () => {
    expect(rappelA(quinzeHeures, 550, 1500)?.formatProposeMl).toBe(250)
    expect(rappelA(quinzeHeures, 500, 1500)?.formatProposeMl).toBe(250)
    expect(rappelA(quinzeHeures, 400, 1500)?.formatProposeMl).toBe(500)
  })

  it('propose au plus 50 cl, même pour un Retard plus grand', () => {
    expect(rappelA(quinzeHeures, 0, 1500)).toEqual({
      quantiteAttendueMl: 750,
      retardMl: 750,
      formatProposeMl: 500,
    })
  })

  it("suit l'Objectif journalier du jour", () => {
    expect(rappelA(quinzeHeures, 700, 1500)).toBeNull()
    expect(rappelA(quinzeHeures, 700, 2000)?.retardMl).toBe(300)
  })
})
