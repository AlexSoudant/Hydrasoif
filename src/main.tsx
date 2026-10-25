import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { horlogeSysteme } from './horloge.ts'
import { creerBase } from './stockage/base.ts'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App base={creerBase()} horloge={horlogeSysteme} />
  </StrictMode>,
)
