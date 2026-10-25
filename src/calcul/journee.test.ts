import { describe, expect, it } from 'vitest'
import { journeeDe, totalBu, type Prise } from './journee'

describe('journeeDe', () => {
  it('rattache une Prise de 3 h 59 à la Journée précédente', () => {
    expect(journeeDe(new Date(2026, 9, 14, 3, 59))).toBe('2026-10-13')
  })

  it('rattache une Prise de 4 h 00 à la nouvelle Journée', () => {
    expect(journeeDe(new Date(2026, 9, 14, 4, 0))).toBe('2026-10-14')
  })

  it('rattache une Prise de 23 h 30 à la Journée du même jour', () => {
    expect(journeeDe(new Date(2026, 9, 14, 23, 30))).toBe('2026-10-14')
  })
})

describe('totalBu', () => {
  const prise = (formatMl: Prise['formatMl'], ...date: [number, number, number, number, number]): Prise => ({
    formatMl,
    horodatage: new Date(...date).getTime(),
  })

  it("additionne les Prises de la Journée, y compris celles d'après minuit", () => {
    const prises = [
      prise(250, 2026, 9, 14, 8, 0),
      prise(125, 2026, 9, 14, 14, 30),
      prise(500, 2026, 9, 15, 1, 0),
    ]
    expect(totalBu(prises, '2026-10-14')).toBe(875)
  })

  it("ignore les Prises des autres Journées", () => {
    const prises = [prise(500, 2026, 9, 14, 3, 0), prise(250, 2026, 9, 15, 4, 0)]
    expect(totalBu(prises, '2026-10-14')).toBe(0)
  })
})
