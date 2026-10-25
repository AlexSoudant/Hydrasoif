import { defineConfig, minimal2023Preset } from '@vite-pwa/assets-generator/config'

// Les icônes avec marge (adaptative Android, Apple) sont complétées en bleu eau plutôt qu'en blanc.
const optionsFondBleuEau = { resizeOptions: { background: '#0b78c4' } }

export default defineConfig({
  headLinkOptions: { preset: '2023' },
  preset: {
    ...minimal2023Preset,
    maskable: { ...minimal2023Preset.maskable, ...optionsFondBleuEau },
    apple: { ...minimal2023Preset.apple, ...optionsFondBleuEau },
  },
  images: ['public/logo.svg'],
})
