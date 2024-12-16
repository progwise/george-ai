import daisyui from 'daisyui'
import typography from '@tailwindcss/typography'
import { type Config } from 'tailwindcss'

export default {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [typography, daisyui],
} satisfies Config
