import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.tsx'
import { horlogeSysteme } from './horloge.ts'
import { creerBase } from './stockage/base.ts'

// Recharge la page dès qu'une nouvelle version déployée a pris la main.
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App base={creerBase()} horloge={horlogeSysteme} />
  </StrictMode>,
)
