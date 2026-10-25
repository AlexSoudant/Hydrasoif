/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Mêmes valeurs que --color-eau-600 et --color-eau-50 dans src/index.css.
const BLEU_EAU = '#0b78c4'
const FOND_EAU = '#eff8ff'

export default defineConfig({
  // GitHub Pages sert le dépôt sous https://<utilisateur>.github.io/Hydrasoif/.
  base: '/Hydrasoif/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // Le nouveau service worker prend la main dès qu'il est prêt, et la page se recharge (voir src/main.tsx).
      registerType: 'autoUpdate',
      injectRegister: false,
      // Les icônes aussi doivent s'afficher hors ligne (le manifeste est ajouté par le plugin).
      workbox: { globPatterns: ['**/*.{js,css,html,ico,png,svg}'] },
      // Icônes générées au build à partir de public/logo.svg (voir pwa-assets.config.ts).
      pwaAssets: { config: true },
      manifest: {
        name: 'Hydrasoif',
        short_name: 'Hydrasoif',
        description: "Suivi de l'eau bue au fil de la journée",
        lang: 'fr',
        display: 'standalone',
        theme_color: BLEU_EAU,
        background_color: FOND_EAU,
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    // Fuseau fixe pour que les tests sur la coupure de 4 h soient déterministes.
    env: { TZ: 'Europe/Paris' },
    setupFiles: ['./src/test/setup.ts'],
  },
})
