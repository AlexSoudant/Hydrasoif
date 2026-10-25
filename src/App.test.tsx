import { cleanup, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
    expect(await screen.findByText("Aucune Journée passée pour l'instant.")).toBeInTheDocument()
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

    it('se masque avec ✕ pendant 30 minutes, puis revient si le Retard persiste', async () => {
      const ecran = demarrerA(new Date(2026, 9, 14, 15, 0))
      const carte = await screen.findByRole('region', { name: 'Rappel' })

      await ecran.utilisateur.click(within(carte).getByRole('button', { name: 'Masquer le Rappel' }))
      expect(rappel()).not.toBeInTheDocument()

      ecran.avancerJusqua(new Date(2026, 9, 14, 15, 29))
      expect(rappel()).not.toBeInTheDocument()

      ecran.avancerJusqua(new Date(2026, 9, 14, 15, 30))
      expect(await screen.findByRole('region', { name: 'Rappel' })).toHaveTextContent('À 15h30 tu as normalement bu')
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

  it('suit le Rythme habituel dès 3 Journées passées', async () => {
    const base = nouvelleBase()
    // Les 11, 12 et 13 octobre : la moitié de l'eau bue avant 11 h.
    for (const jour of [11, 12, 13]) {
      await base.ajouterPrise(500, new Date(2026, 9, jour, 9, 0))
      await base.ajouterPrise(500, new Date(2026, 9, jour, 13, 0))
    }
    render(<App base={base} horloge={horlogeFixe(new Date(2026, 9, 14, 11, 0))} />)

    // La Référence de démarrage aurait attendu 32 cl ; le Rythme habituel en attend la moitié de 1,5 L.
    expect(await screen.findByRole('region', { name: 'Rappel' })).toHaveTextContent(
      'À 11h tu as normalement bu 75 cl ! Reprends un verre de 75 cl pour rester dans la course :)',
    )
  })
})

describe('ligne de Quantité attendue sur le verre', () => {
  const verre = () => screen.findByRole('progressbar', { name: 'Eau bue aujourd’hui' })
  /** Le libellé est annoncé une seule fois, dans le texte de la barre de progression. */
  const annonce = async () => (await verre()).getAttribute('aria-valuetext')

  afterEach(() => {
    vi.useRealTimers()
  })

  it('indique la Quantité attendue à cet instant', async () => {
    // À 11 h, la Référence de démarrage attend 3/14 de 1,5 L, soit environ 32 cl.
    render(<App base={nouvelleBase()} horloge={horlogeFixe(new Date(2026, 9, 14, 11, 0))} />)

    await waitFor(async () => expect(await annonce()).toBe('0 cl / 1,50 L · 0 % · Attendu : 32 cl'))
  })

  it('affiche aussi la Quantité attendue en toutes lettres dans le verre', async () => {
    render(<App base={nouvelleBase()} horloge={horlogeFixe(new Date(2026, 9, 14, 11, 0))} />)

    expect(await within(await verre()).findByText('Attendu : 32 cl')).toBeVisible()
  })

  it('suit le Rythme habituel dès 3 Journées passées', async () => {
    const base = nouvelleBase()
    for (const jour of [11, 12, 13]) {
      await base.ajouterPrise(500, new Date(2026, 9, jour, 9, 0))
      await base.ajouterPrise(500, new Date(2026, 9, jour, 13, 0))
    }
    render(<App base={base} horloge={horlogeFixe(new Date(2026, 9, 14, 11, 0))} />)

    await waitFor(async () => expect(await annonce()).toContain('Attendu : 75 cl'))
  })

  it('avance à chaque minute', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'], shouldAdvanceTime: true })
    const horloge = horlogeReglable(new Date(2026, 9, 14, 11, 0))
    render(<App base={nouvelleBase()} horloge={horloge} />)
    await waitFor(async () => expect(await annonce()).toContain('Attendu : 32 cl'))

    horloge.regler(new Date(2026, 9, 14, 11, 1))
    act(() => vi.advanceTimersByTime(60_000))

    await waitFor(async () => expect(await annonce()).toContain('Attendu : 32,5 cl'))
  })

  it('reste visible quand le Rappel est masqué', async () => {
    const utilisateur = userEvent.setup()
    render(<App base={nouvelleBase()} horloge={horlogeFixe(new Date(2026, 9, 14, 11, 0))} />)
    const carte = await screen.findByRole('region', { name: 'Rappel' })

    await utilisateur.click(within(carte).getByRole('button', { name: 'Masquer le Rappel' }))

    expect(screen.queryByRole('region', { name: 'Rappel' })).not.toBeInTheDocument()
    expect(await annonce()).toContain('Attendu : 32 cl')
  })

  it("disparaît une fois l'Objectif journalier atteint", async () => {
    const utilisateur = userEvent.setup()
    render(<App base={nouvelleBase()} horloge={horlogeFixe(new Date(2026, 9, 14, 11, 0))} />)
    await waitFor(async () => expect(await annonce()).toContain('Attendu : 32 cl'))

    for (let i = 0; i < 3; i++) await utilisateur.click(screen.getByRole('button', { name: '50 cl' }))

    await waitFor(async () => expect(await annonce()).toBe('1,50 / 1,50 L · 100 %'))
  })
})

describe('Historique', () => {
  const mercredi14a10h = new Date(2026, 9, 14, 10, 0)

  async function ouvrirHistorique(base: ReturnType<typeof nouvelleBase>) {
    const utilisateur = userEvent.setup()
    render(<App base={base} horloge={horlogeFixe(mercredi14a10h)} />)
    await utilisateur.click(within(screen.getByRole('navigation')).getByRole('button', { name: 'Historique' }))
    return utilisateur
  }

  const journeesAffichees = async () =>
    within(await screen.findByRole('list', { name: 'Journées passées' }))
      .getAllByRole('listitem')
      .map((ligne) => ligne.textContent)

  it('liste les Journées passées avec Prise, de la plus récente à la plus ancienne', async () => {
    const base = nouvelleBase()
    await base.ajouterPrise(500, new Date(2026, 9, 12, 9, 0))
    await base.ajouterPrise(500, new Date(2026, 9, 12, 15, 0))
    await base.ajouterPrise(250, new Date(2026, 9, 13, 9, 0))
    // La Journée en cours n'apparaît pas, et le 11 octobre n'a aucune Prise.
    await base.ajouterPrise(500, new Date(2026, 9, 14, 8, 0))

    await ouvrirHistorique(base)

    expect(await journeesAffichees()).toEqual(['mar. 13 oct. · 0,25 / 1,50 L', 'lun. 12 oct. · 1,00 / 1,50 L'])
  })

  it('marque d’un ✓ seulement les Journées où l’objectif est atteint', async () => {
    const base = nouvelleBase()
    for (const heure of [8, 12, 18]) await base.ajouterPrise(500, new Date(2026, 9, 12, heure, 0))
    await base.ajouterPrise(500, new Date(2026, 9, 13, 9, 0))

    await ouvrirHistorique(base)
    const lignes = within(await screen.findByRole('list', { name: 'Journées passées' })).getAllByRole('listitem')

    expect(within(lignes[0]).queryByRole('img', { name: 'Objectif atteint' })).not.toBeInTheDocument()
    expect(within(lignes[1]).getByRole('img', { name: 'Objectif atteint' })).toBeInTheDocument()
  })

  it('affiche pour chaque Journée l’Objectif journalier qu’elle avait', async () => {
    const base = nouvelleBase()
    await base.ajouterPrise(250, new Date(2026, 9, 11, 9, 0))
    await base.ajouterPrise(250, new Date(2026, 9, 13, 9, 0))
    // L'objectif passe à 1,75 L à partir du 12 octobre.
    await base.ajusterObjectif('2026-10-12', 250)

    await ouvrirHistorique(base)

    expect(await journeesAffichees()).toEqual(['mar. 13 oct. · 0,25 / 1,75 L', 'dim. 11 oct. · 0,25 / 1,50 L'])
  })

  it('range une Prise bue entre minuit et 4 h dans la Journée de la veille', async () => {
    const base = nouvelleBase()
    await base.ajouterPrise(500, new Date(2026, 9, 12, 20, 0))
    await base.ajouterPrise(250, new Date(2026, 9, 13, 1, 30))

    await ouvrirHistorique(base)

    expect(await journeesAffichees()).toEqual(['lun. 12 oct. · 0,75 / 1,50 L'])
  })

  it('montre les Prises d’une Journée passée, en lecture seule', async () => {
    const base = nouvelleBase()
    await base.ajouterPrise(500, new Date(2026, 9, 12, 9, 0))
    await base.ajouterPrise(125, new Date(2026, 9, 12, 17, 45))
    const utilisateur = await ouvrirHistorique(base)

    await utilisateur.click(await screen.findByRole('button', { name: /lun\. 12 oct\./ }))

    const detail = await screen.findByRole('list', { name: 'Prises de lun. 12 oct.' })
    expect(within(detail).getAllByRole('listitem').map((ligne) => ligne.textContent)).toEqual([
      '09:00 · 50 cl',
      '17:45 · 12,5 cl',
    ])
    expect(within(detail).queryAllByRole('button')).toHaveLength(0)

    await utilisateur.click(screen.getByRole('button', { name: 'Retour' }))
    expect(await screen.findByRole('list', { name: 'Journées passées' })).toBeInTheDocument()
  })
})

describe('Export et import JSON', () => {
  const mercredi14a10h = new Date(2026, 9, 14, 10, 0)
  let fichierTelecharge: Blob | null

  beforeEach(() => {
    fichierTelecharge = null
    // jsdom ne sait ni créer d'URL de Blob ni télécharger : on récupère le fichier au passage.
    URL.createObjectURL = vi.fn((blob: Blob) => {
      fichierTelecharge = blob
      return 'blob:hydrasoif'
    })
    URL.revokeObjectURL = vi.fn()
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  async function baseAvecDeuxJournees() {
    const base = nouvelleBase()
    await base.ajouterPrise(500, new Date(2026, 9, 12, 9, 0))
    await base.ajouterPrise(250, new Date(2026, 9, 12, 21, 30))
    await base.ajouterPrise(125, new Date(2026, 9, 13, 1, 15))
    await base.ajouterPrise(500, new Date(2026, 9, 13, 10, 0))
    await base.ajusterObjectif('2026-10-13', 250)
    return base
  }

  async function ouvrir(ecran: string, base: ReturnType<typeof nouvelleBase>) {
    const utilisateur = userEvent.setup()
    render(<App base={base} horloge={horlogeFixe(mercredi14a10h)} />)
    await utilisateur.click(within(screen.getByRole('navigation')).getByRole('button', { name: ecran }))
    return utilisateur
  }

  async function exporter(base: ReturnType<typeof nouvelleBase>) {
    const utilisateur = await ouvrir('Réglages', base)
    await utilisateur.click(await screen.findByRole('button', { name: 'Exporter' }))
    await waitFor(() => expect(fichierTelecharge).not.toBeNull())
    const texte = await fichierTelecharge!.text()
    cleanup()
    return texte
  }

  async function importer(base: ReturnType<typeof nouvelleBase>, contenu: string) {
    const utilisateur = await ouvrir('Réglages', base)
    const fichier = new File([contenu], 'sauvegarde.json', { type: 'application/json' })
    await utilisateur.upload(await screen.findByLabelText('Importer'), fichier)
    return utilisateur
  }

  async function journeesDeLHistorique(utilisateur: ReturnType<typeof userEvent.setup>) {
    await utilisateur.click(within(screen.getByRole('navigation')).getByRole('button', { name: 'Historique' }))
    const liste = await screen.findByRole('list', { name: 'Journées passées' })
    return within(liste)
      .getAllByRole('listitem')
      .map((ligne) => ligne.textContent)
  }

  it('restaure dans une base vide les mêmes Journées, Prises et objectifs', async () => {
    const texte = await exporter(await baseAvecDeuxJournees())
    expect(JSON.parse(texte)).toMatchObject({ version: 1 })

    const baseVide = nouvelleBase()
    const utilisateur = await importer(baseVide, texte)
    const confirmation = await screen.findByRole('alertdialog')
    expect(confirmation).toHaveTextContent("Tu n'as encore aucune Journée : rien ne sera remplacé.")
    await utilisateur.click(within(confirmation).getByRole('button', { name: 'Remplacer' }))

    expect(await screen.findByText('Sauvegarde importée : 2 Journées.')).toBeInTheDocument()
    expect(await screen.findByText('1,75 L')).toBeInTheDocument()
    expect(await journeesDeLHistorique(utilisateur)).toEqual([
      'mar. 13 oct. · 0,50 / 1,75 L',
      'lun. 12 oct. · 0,88 / 1,50 L',
    ])
    await utilisateur.click(screen.getByRole('button', { name: /lun\. 12 oct\./ }))
    expect(
      within(await screen.findByRole('list', { name: 'Prises de lun. 12 oct.' }))
        .getAllByRole('listitem')
        .map((ligne) => ligne.textContent),
    ).toEqual(['09:00 · 50 cl', '21:30 · 25 cl', '01:15 · 12,5 cl'])
  })

  it('ne modifie rien si la confirmation est annulée', async () => {
    const texte = await exporter(await baseAvecDeuxJournees())
    const autreBase = nouvelleBase()
    await autreBase.ajouterPrise(250, new Date(2026, 9, 10, 9, 0))

    const utilisateur = await importer(autreBase, texte)
    const confirmation = await screen.findByRole('alertdialog')
    expect(confirmation).toHaveTextContent('Ceci remplacera ta 1 Journée actuelle.')
    await utilisateur.click(within(confirmation).getByRole('button', { name: 'Annuler' }))

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(await journeesDeLHistorique(utilisateur)).toEqual(['sam. 10 oct. · 0,25 / 1,50 L'])
  })

  it.each([
    ['un JSON illisible', 'pas du JSON {'],
    ['une mauvaise structure', JSON.stringify({ version: 1, prises: [{ formatMl: 333, horodatage: 'hier' }], objectifs: [] })],
    ['une version inconnue', JSON.stringify({ version: 99, prises: [], objectifs: [] })],
    [
      'deux objectifs pour la même Journée',
      JSON.stringify({
        version: 1,
        prises: [],
        objectifs: [
          { journee: '2026-10-12', objectifMl: 1250 },
          { journee: '2026-10-12', objectifMl: 1750 },
        ],
      }),
    ],
    [
      'un objectif hors du pas de 25 cl',
      JSON.stringify({ version: 1, prises: [], objectifs: [{ journee: '2026-10-12', objectifMl: 1333 }] }),
    ],
    [
      'une Journée impossible',
      JSON.stringify({ version: 1, prises: [], objectifs: [{ journee: '2026-13-45', objectifMl: 1500 }] }),
    ],
    [
      'un horodatage aberrant',
      JSON.stringify({ version: 1, prises: [{ formatMl: 250, horodatage: -5 }], objectifs: [] }),
    ],
  ])('refuse %s sans rien modifier', async (_cas, contenu) => {
    const base = await baseAvecDeuxJournees()

    const utilisateur = await importer(base, contenu)

    expect(await screen.findByRole('alert')).toHaveTextContent("Ce fichier n'est pas une sauvegarde Hydrasoif valide")
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument()
    expect(await journeesDeLHistorique(utilisateur)).toEqual([
      'mar. 13 oct. · 0,50 / 1,75 L',
      'lun. 12 oct. · 0,88 / 1,50 L',
    ])
  })
})

