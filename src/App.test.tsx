import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
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
