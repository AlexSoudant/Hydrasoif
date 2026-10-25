import { describe, expect, it } from 'vitest'
import { objectifDe, type ChangementObjectif } from './objectif'

describe('objectifDe', () => {
  it("vaut 1500 ml tant qu'aucun Objectif journalier n'a été réglé", () => {
    expect(objectifDe('2026-10-14', [])).toBe(1500)
  })

  it("applique la dernière valeur fixée au plus tard cette Journée", () => {
    const changements: ChangementObjectif[] = [
      { journee: '2026-10-01', objectifMl: 1250 },
      { journee: '2026-10-10', objectifMl: 1750 },
    ]
    expect(objectifDe('2026-10-05', changements)).toBe(1250)
    expect(objectifDe('2026-10-10', changements)).toBe(1750)
    expect(objectifDe('2026-10-14', changements)).toBe(1750)
  })

  it("ne modifie pas l'objectif d'une Journée passée quand on le change aujourd'hui", () => {
    const changements: ChangementObjectif[] = [{ journee: '2026-10-14', objectifMl: 2000 }]
    expect(objectifDe('2026-10-13', changements)).toBe(1500)
    expect(objectifDe('2026-10-14', changements)).toBe(2000)
  })
})
