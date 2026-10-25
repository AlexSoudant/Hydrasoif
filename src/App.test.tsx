import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { horlogeFixe } from './horloge'
import { creerBase } from './stockage/base'

function nouvelleBase() {
  return creerBase(`test-${crypto.randomUUID()}`)
}

describe("écran Aujourd'hui", () => {
  it('enregistre une Prise à l’heure actuelle et met le total à jour', async () => {
    const utilisateur = userEvent.setup()
    render(<App base={nouvelleBase()} horloge={horlogeFixe(new Date(2026, 9, 14, 10, 30))} />)

    await utilisateur.click(screen.getByRole('button', { name: '25 cl' }))

    const liste = screen.getByRole('list', { name: 'Prises du jour' })
    expect(await within(liste).findByText('10:30')).toBeInTheDocument()
    expect(within(liste).getByText('25 cl')).toBeInTheDocument()
    expect(screen.getByText('25 cl / 1,50 L')).toBeInTheDocument()
  })

  it('retrouve les Prises après un rechargement de la page', async () => {
    const utilisateur = userEvent.setup()
    const nom = `test-${crypto.randomUUID()}`
    const horloge = horlogeFixe(new Date(2026, 9, 14, 10, 30))
    const premiereVisite = render(<App base={creerBase(nom)} horloge={horloge} />)
    await utilisateur.click(screen.getByRole('button', { name: '12,5 cl' }))
    await utilisateur.click(screen.getByRole('button', { name: '50 cl' }))
    expect(await screen.findByText('62,5 cl / 1,50 L')).toBeInTheDocument()
    premiereVisite.unmount()

    render(<App base={creerBase(nom)} horloge={horloge} />)

    expect(await screen.findByText('62,5 cl / 1,50 L')).toBeInTheDocument()
    expect(within(screen.getByRole('list', { name: 'Prises du jour' })).getAllByRole('listitem')).toHaveLength(2)
  })

  it('reste sur la Journée de la veille entre minuit et 4 h', async () => {
    const base = nouvelleBase()
    await base.ajouterPrise(250, new Date(2026, 9, 14, 23, 0))
    await base.ajouterPrise(500, new Date(2026, 9, 14, 3, 0))

    render(<App base={base} horloge={horlogeFixe(new Date(2026, 9, 15, 1, 15))} />)

    expect(screen.getByText('mer. 14 oct.')).toBeInTheDocument()
    expect(await screen.findByText('25 cl / 1,50 L')).toBeInTheDocument()
    expect(within(screen.getByRole('list', { name: 'Prises du jour' })).getByText('23:00')).toBeInTheDocument()
  })
})

describe('corriger une Prise', () => {
  const dixHeuresTrente = new Date(2026, 9, 14, 10, 30)

  it('« Annuler » supprime la Prise qui vient d’être ajoutée', async () => {
    const utilisateur = userEvent.setup()
    render(<App base={nouvelleBase()} horloge={horlogeFixe(dixHeuresTrente)} />)
    await utilisateur.click(screen.getByRole('button', { name: '25 cl' }))
    await utilisateur.click(screen.getByRole('button', { name: '50 cl' }))
    expect(await screen.findByText('75 cl / 1,50 L')).toBeInTheDocument()

    expect(screen.getByRole('status')).toHaveTextContent('Prise de 50 cl ajoutée · Annuler')
    await utilisateur.click(within(screen.getByRole('status')).getByRole('button', { name: 'Annuler' }))

    expect(await screen.findByText('25 cl / 1,50 L')).toBeInTheDocument()
    expect(within(screen.getByRole('list', { name: 'Prises du jour' })).getAllByRole('listitem')).toHaveLength(1)
  })

  it('retire le message « Annuler » si la Prise est supprimée depuis son menu', async () => {
    const utilisateur = userEvent.setup()
    render(<App base={nouvelleBase()} horloge={horlogeFixe(dixHeuresTrente)} />)
    await utilisateur.click(screen.getByRole('button', { name: '25 cl' }))

    await utilisateur.click(await screen.findByRole('button', { name: 'Options de la Prise de 10:30' }))
    await utilisateur.click(screen.getByRole('button', { name: 'Supprimer' }))

    expect(await screen.findByText('0 cl / 1,50 L')).toBeInTheDocument()
    expect(screen.getByRole('status')).toBeEmptyDOMElement()
  })

  describe('avec le temps simulé', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    async function ajouterUnePriseDe25cl() {
      // shouldAdvanceTime : IndexedDB simulée et findBy* continuent d'avancer en temps réel.
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'], shouldAdvanceTime: true })
      const utilisateur = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
      render(<App base={nouvelleBase()} horloge={horlogeFixe(dixHeuresTrente)} />)
      await utilisateur.click(screen.getByRole('button', { name: '25 cl' }))
      expect(await screen.findByText('25 cl / 1,50 L')).toBeInTheDocument()
      return utilisateur
    }

    it('« Annuler » fonctionne encore juste avant 5 secondes', async () => {
      const utilisateur = await ajouterUnePriseDe25cl()

      act(() => vi.advanceTimersByTime(4_900))
      await utilisateur.click(within(screen.getByRole('status')).getByRole('button', { name: 'Annuler' }))

      expect(await screen.findByText('0 cl / 1,50 L')).toBeInTheDocument()
    })

    it('le message « Annuler » disparaît au bout de 5 secondes', async () => {
      await ajouterUnePriseDe25cl()

      act(() => vi.advanceTimersByTime(5_000))

      expect(screen.getByRole('status')).toBeEmptyDOMElement()
      expect(screen.getByText('25 cl / 1,50 L')).toBeInTheDocument()
    })
  })
})

describe("menu d'une Prise", () => {
  const quinzeHeures = new Date(2026, 9, 14, 15, 0)

  async function ecranAvecDeuxPrises() {
    const base = nouvelleBase()
    await base.ajouterPrise(250, new Date(2026, 9, 14, 8, 0))
    await base.ajouterPrise(500, new Date(2026, 9, 14, 9, 0))
    render(<App base={base} horloge={horlogeFixe(quinzeHeures)} />)
    expect(await screen.findByText('75 cl / 1,50 L')).toBeInTheDocument()
    return userEvent.setup()
  }

  function heuresAffichees() {
    return within(screen.getByRole('list', { name: 'Prises du jour' }))
      .getAllByRole('listitem')
      .map((ligne) => ligne.textContent?.slice(0, 5))
  }

  it('supprime une Prise', async () => {
    const utilisateur = await ecranAvecDeuxPrises()

    await utilisateur.click(screen.getByRole('button', { name: 'Options de la Prise de 09:00' }))
    await utilisateur.click(screen.getByRole('button', { name: 'Supprimer' }))

    expect(await screen.findByText('25 cl / 1,50 L')).toBeInTheDocument()
    expect(heuresAffichees()).toEqual(['08:00'])
  })

  async function modifierHeure(utilisateur: ReturnType<typeof userEvent.setup>, de: string, vers: string) {
    await utilisateur.click(screen.getByRole('button', { name: `Options de la Prise de ${de}` }))
    await utilisateur.click(screen.getByRole('button', { name: "Modifier l'heure" }))
    const champ = screen.getByLabelText('Nouvelle heure')
    await utilisateur.clear(champ)
    await utilisateur.type(champ, vers)
    await utilisateur.click(screen.getByRole('button', { name: 'Enregistrer' }))
  }

  it("modifie l'heure d'une Prise et garde la liste triée par heure", async () => {
    const utilisateur = await ecranAvecDeuxPrises()

    await modifierHeure(utilisateur, '09:00', '07:30')

    await waitFor(() => expect(heuresAffichees()).toEqual(['07:30', '08:00']))
    expect(screen.getByText('75 cl / 1,50 L')).toBeInTheDocument()
  })

  it.each([
    ['dans le futur', '16:00'],
    ['avant 4 h (ce serait le lendemain matin)', '03:30'],
  ])("refuse une heure %s et ne modifie rien", async (_cas, heure) => {
    const utilisateur = await ecranAvecDeuxPrises()

    await modifierHeure(utilisateur, '09:00', heure)

    expect(await screen.findByRole('alert')).toHaveTextContent("L'heure doit être comprise entre 04:00 et maintenant.")
    expect(heuresAffichees()).toEqual(['08:00', '09:00'])
  })
})


describe('Objectif journalier', () => {
  const dixHeures = new Date(2026, 9, 14, 10, 0)

  async function allerA(utilisateur: ReturnType<typeof userEvent.setup>, ecran: string) {
    await utilisateur.click(within(screen.getByRole('navigation')).getByRole('button', { name: ecran }))
  }

  it("se règle dans les Réglages et s'affiche sur l'écran Aujourd'hui", async () => {
    const utilisateur = userEvent.setup()
    render(<App base={nouvelleBase()} horloge={horlogeFixe(dixHeures)} />)

    await allerA(utilisateur, 'Réglages')
    expect(await screen.findByText('1,50 L')).toBeInTheDocument()
    await utilisateur.click(screen.getByRole('button', { name: "Augmenter l'objectif" }))
    expect(await screen.findByText('1,75 L')).toBeInTheDocument()

    await allerA(utilisateur, "Aujourd'hui")
    expect(await screen.findByText('0 cl / 1,75 L')).toBeInTheDocument()
  })

  it('désactive − et + aux bornes de 1 L et 2 L', async () => {
    const utilisateur = userEvent.setup()
    render(<App base={nouvelleBase()} horloge={horlogeFixe(dixHeures)} />)
    await allerA(utilisateur, 'Réglages')
    const augmenter = await screen.findByRole('button', { name: "Augmenter l'objectif" })
    const diminuer = screen.getByRole('button', { name: "Diminuer l'objectif" })

    await utilisateur.click(augmenter)
    await utilisateur.click(await screen.findByRole('button', { name: "Augmenter l'objectif" }))
    expect(await screen.findByText('2,00 L')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: "Augmenter l'objectif" })).toBeDisabled()
    expect(diminuer).toBeEnabled()

    for (const attendu of ['1,75 L', '1,50 L', '1,25 L', '1,00 L']) {
      await utilisateur.click(screen.getByRole('button', { name: "Diminuer l'objectif" }))
      expect(await screen.findByText(attendu)).toBeInTheDocument()
    }
    expect(screen.getByRole('button', { name: "Diminuer l'objectif" })).toBeDisabled()
    expect(screen.getByRole('button', { name: "Augmenter l'objectif" })).toBeEnabled()
  })

  it("garde l'objectif réglé après un rechargement de la page", async () => {
    const utilisateur = userEvent.setup()
    const nom = `test-${crypto.randomUUID()}`
    const premiereVisite = render(<App base={creerBase(nom)} horloge={horlogeFixe(dixHeures)} />)
    await allerA(utilisateur, 'Réglages')
    await utilisateur.click(await screen.findByRole('button', { name: "Diminuer l'objectif" }))
    expect(await screen.findByText('1,25 L')).toBeInTheDocument()
    premiereVisite.unmount()

    render(<App base={creerBase(nom)} horloge={horlogeFixe(dixHeures)} />)

    expect(await screen.findByText('0 cl / 1,25 L')).toBeInTheDocument()
  })

  it("affiche un écran Historique vide pour l'instant", async () => {
    const utilisateur = userEvent.setup()
    render(<App base={nouvelleBase()} horloge={horlogeFixe(dixHeures)} />)

    await allerA(utilisateur, 'Historique')

    expect(screen.getByRole('heading', { name: 'Historique' })).toBeInTheDocument()
    expect(screen.getByText("Aucune Journée passée pour l'instant.")).toBeInTheDocument()
    expect(within(screen.getByRole('navigation')).getByRole('button', { name: 'Historique' })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('compte chaque appui, même rapproché', async () => {
    const utilisateur = userEvent.setup()
    render(<App base={nouvelleBase()} horloge={horlogeFixe(dixHeures)} />)
    await allerA(utilisateur, 'Réglages')
    const augmenter = await screen.findByRole('button', { name: "Augmenter l'objectif" })

    await Promise.all([utilisateur.click(augmenter), utilisateur.click(augmenter)])

    expect(await screen.findByText('2,00 L')).toBeInTheDocument()
  })
})

