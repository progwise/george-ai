import typography from '@tailwindcss/typography'
import daisyui from 'daisyui'
import { type Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}'],
  daisyui: {
    themes: ['light', 'dark'],
  },
  plugins: [typography, daisyui],
} satisfies Config
