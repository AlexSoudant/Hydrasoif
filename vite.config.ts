/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    // Fuseau fixe pour que les tests sur la coupure de 4 h soient déterministes.
    env: { TZ: 'Europe/Paris' },
    setupFiles: ['./src/test/setup.ts'],
  },
})
