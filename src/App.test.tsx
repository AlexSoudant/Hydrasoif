import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import type { FormatDeVerreMl } from './calcul/journee'
import { enCentilitres } from './format'
import { horlogeFixe } from './horloge'
import { creerBase } from './stockage/base'
import { horlogeReglable } from './test/horlogeReglable'

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


describe('verre de progression', () => {
  const midi = new Date(2026, 9, 14, 12, 0)

  async function ecranAvecPrises(...formatsMl: FormatDeVerreMl[]) {
    const utilisateur = userEvent.setup()
    render(<App base={nouvelleBase()} horloge={horlogeFixe(midi)} />)
    for (const formatMl of formatsMl) {
      await utilisateur.click(screen.getByRole('button', { name: enCentilitres(formatMl) }))
    }
    return screen.findByRole('progressbar', { name: 'Eau bue aujourd’hui' })
  }

  it('est vide en début de Journée', async () => {
    const verre = await ecranAvecPrises()

    await waitFor(() => expect(verre).toHaveAttribute('aria-valuenow', '0'))
    expect(verre).toHaveAttribute('aria-valuemin', '0')
    expect(verre).toHaveAttribute('aria-valuemax', '1500')
    expect(within(verre).getByText('0 cl / 1,50 L')).toBeInTheDocument()
    expect(within(verre).getByText('0 %')).toBeInTheDocument()
  })

  it('se remplit en proportion de l’Objectif journalier', async () => {
    const verre = await ecranAvecPrises(250)

    await waitFor(() => expect(verre).toHaveAttribute('aria-valuenow', '250'))
    expect(within(verre).getByText('25 cl / 1,50 L')).toBeInTheDocument()
    expect(within(verre).getByText('17 %')).toBeInTheDocument()
  })

  it('est plein et félicite quand l’Objectif journalier est atteint', async () => {
    const verre = await ecranAvecPrises(500, 500, 500)

    await waitFor(() => expect(verre).toHaveAttribute('aria-valuenow', '1500'))
    expect(within(verre).getByText('1,50 / 1,50 L')).toBeInTheDocument()
    expect(within(verre).getByText('100 %')).toBeInTheDocument()
    expect(within(verre).getByText('Objectif atteint, bravo !')).toBeInTheDocument()
  })

  it('reste plein et affiche le dépassement au-delà de l’objectif', async () => {
    const verre = await ecranAvecPrises(500, 500, 500, 125)

    await waitFor(() => expect(verre).toHaveAttribute('aria-valuenow', '1500'))
    expect(within(verre).getByText('1,63 / 1,50 L')).toBeInTheDocument()
    expect(within(verre).getByText('+12,5 cl')).toBeInTheDocument()
    expect(within(verre).getByText('Objectif atteint, bravo !')).toBeInTheDocument()
  })

  it('ne félicite pas avant que l’objectif soit atteint', async () => {
    const verre = await ecranAvecPrises(500, 500, 250, 125)

    await waitFor(() => expect(verre).toHaveAttribute('aria-valuenow', '1375'))
    expect(within(verre).getByText('92 %')).toBeInTheDocument()
    expect(within(verre).queryByText('Objectif atteint, bravo !')).not.toBeInTheDocument()
  })

  it('permet de continuer à enregistrer des Prises au-delà de 100 %', async () => {
    const verre = await ecranAvecPrises(500, 500, 500)
    await waitFor(() => expect(verre).toHaveAttribute('aria-valuenow', '1500'))

    await userEvent.setup().click(screen.getByRole('button', { name: '50 cl' }))

    expect(await within(verre).findByText('+50 cl')).toBeInTheDocument()
    expect(within(verre).getByText('2,00 / 1,50 L')).toBeInTheDocument()
  })
})

describe('Rappel', () => {
  const rappel = () => screen.queryByRole('region', { name: 'Rappel' })

  it('apparaît en cas de Retard et enregistre le verre proposé', async () => {
    const utilisateur = userEvent.setup()
    // À 11 h, la référence de démarrage attend 3/14 de 1,5 L, soit environ 32 cl.
    render(<App base={nouvelleBase()} horloge={horlogeFixe(new Date(2026, 9, 14, 11, 0))} />)

    const carte = await screen.findByRole('region', { name: 'Rappel' })
    expect(carte).toHaveTextContent(
      'À 11h tu as normalement bu 32 cl ! Reprends un verre de 32 cl pour rester dans la course :)',
    )

    await utilisateur.click(within(carte).getByRole('button', { name: '+ 50 cl' }))

    expect(await screen.findByText('50 cl / 1,50 L')).toBeInTheDocument()
    await waitFor(() => expect(rappel()).not.toBeInTheDocument())
  })

  it("n'apparaît pas tant que le Retard est inférieur à 12,5 cl", async () => {
    render(<App base={nouvelleBase()} horloge={horlogeFixe(new Date(2026, 9, 14, 9, 0))} />)

    expect(await screen.findByText('0 cl / 1,50 L')).toBeInTheDocument()
    expect(rappel()).not.toBeInTheDocument()
  })

  describe('avec le temps simulé', () => {
    afterEach(() => {
      vi.useRealTimers()
    })

    function demarrerA(instant: Date, base = nouvelleBase()) {
      // shouldAdvanceTime : IndexedDB simulée et findBy* continuent d'avancer en temps réel.
      vi.useFakeTimers({
        toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'],
        shouldAdvanceTime: true,
      })
      const horloge = horlogeReglable(instant)
      render(<App base={base} horloge={horloge} />)
      return {
        utilisateur: userEvent.setup({ advanceTimers: vi.advanceTimersByTime }),
        /** Fait passer le temps jusqu'à cet instant, comme sur un vrai téléphone. */
        avancerJusqua(cible: Date) {
          const ecartMs = cible.getTime() - horloge.maintenant().getTime()
          horloge.regler(cible)
          act(() => vi.advanceTimersByTime(ecartMs))
        },
        /** L'heure a changé pendant que l'application était en arrière-plan, puis elle revient. */
        revenirAuPremierPlanA(cible: Date) {
          horloge.regler(cible)
          act(() => {
            document.dispatchEvent(new Event('visibilitychange'))
          })
        },
      }
    }

    it('vérifie le Retard chaque minute tant que l’application est ouverte', async () => {
      const ecran = demarrerA(new Date(2026, 9, 14, 9, 0))
      expect(await screen.findByText('0 cl / 1,50 L')).toBeInTheDocument()
      expect(rappel()).not.toBeInTheDocument()

      // À 9 h 10, la Quantité attendue atteint 12,5 cl.
      ecran.avancerJusqua(new Date(2026, 9, 14, 9, 10))

      expect(await screen.findByRole('region', { name: 'Rappel' })).toHaveTextContent(
        'À 9h10 tu as normalement bu 12,5 cl ! Reprends un verre de 12,5 cl pour rester dans la course :)',
      )
    })

    it("vérifie le Retard dès que l'application revient au premier plan", async () => {
      const ecran = demarrerA(new Date(2026, 9, 14, 9, 0))
      expect(await screen.findByText('0 cl / 1,50 L')).toBeInTheDocument()

      ecran.revenirAuPremierPlanA(new Date(2026, 9, 14, 11, 0))

      expect(await screen.findByRole('region', { name: 'Rappel' })).toHaveTextContent('À 11h tu as normalement bu')
    })

    it('passe tout seul à la nouvelle Journée à 4 h précises', async () => {
      const base = nouvelleBase()
      await base.ajouterPrise(250, new Date(2026, 9, 14, 23, 0))
      const ecran = demarrerA(new Date(2026, 9, 15, 3, 59, 30), base)
      expect(await screen.findByText('25 cl / 1,50 L')).toBeInTheDocument()
      expect(screen.getByText('mer. 14 oct.')).toBeInTheDocument()

      ecran.avancerJusqua(new Date(2026, 9, 15, 4, 0))

      expect(await screen.findByText('jeu. 15 oct.')).toBeInTheDocument()
      expect(await screen.findByText('0 cl / 1,50 L')).toBeInTheDocument()
      await waitFor(() =>
        expect(within(screen.getByRole('list', { name: 'Prises du jour' })).queryAllByRole('listitem')).toHaveLength(0),
      )
    })

    it('ne garde pas le message « Annuler » de la veille sur la nouvelle Journée', async () => {
      const ecran = demarrerA(new Date(2026, 9, 15, 3, 59, 58))
      await ecran.utilisateur.click(await screen.findByRole('button', { name: '25 cl' }))
      await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Prise de 25 cl ajoutée'))

      ecran.avancerJusqua(new Date(2026, 9, 15, 4, 0))

      expect(await screen.findByText('jeu. 15 oct.')).toBeInTheDocument()
      expect(screen.getByRole('status')).toBeEmptyDOMElement()
    })
  })

  it("suit aussitôt un changement d'Objectif journalier", async () => {
    const utilisateur = userEvent.setup()
    // À 15 h, avec 75 cl bus : rien d'attendu en plus pour 1,5 L (75 cl), mais 25 cl de Retard pour 2 L (100 cl).
    const base = nouvelleBase()
    await base.ajouterPrise(500, new Date(2026, 9, 14, 9, 0))
    await base.ajouterPrise(250, new Date(2026, 9, 14, 12, 0))
    render(<App base={base} horloge={horlogeFixe(new Date(2026, 9, 14, 15, 0))} />)
    expect(await screen.findByText('75 cl / 1,50 L')).toBeInTheDocument()
    expect(rappel()).not.toBeInTheDocument()

    const navigation = screen.getByRole('navigation')
    await utilisateur.click(within(navigation).getByRole('button', { name: 'Réglages' }))
    await utilisateur.click(await screen.findByRole('button', { name: "Augmenter l'objectif" }))
    await utilisateur.click(await screen.findByRole('button', { name: "Augmenter l'objectif" }))
    expect(await screen.findByText('2,00 L')).toBeInTheDocument()
    await utilisateur.click(within(navigation).getByRole('button', { name: "Aujourd'hui" }))

    expect(await screen.findByRole('region', { name: 'Rappel' })).toHaveTextContent(
      'À 15h tu as normalement bu 100 cl ! Reprends un verre de 25 cl pour rester dans la course :)',
    )
  })

  it('reste affiché après le verre proposé si le Retard dépassait 50 cl', async () => {
    const utilisateur = userEvent.setup()
    // À 15 h, rien de bu : 75 cl de Retard, donc 25 cl restent après un verre de 50 cl.
    render(<App base={nouvelleBase()} horloge={horlogeFixe(new Date(2026, 9, 14, 15, 0))} />)

    await utilisateur.click(within(await screen.findByRole('region', { name: 'Rappel' })).getByRole('button', { name: '+ 50 cl' }))

    expect(await screen.findByText('50 cl / 1,50 L')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Rappel' })).toHaveTextContent('Reprends un verre de 25 cl')
    expect(within(screen.getByRole('region', { name: 'Rappel' })).getByRole('button', { name: '+ 25 cl' })).toBeInTheDocument()
  })
})

