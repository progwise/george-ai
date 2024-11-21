import daisyui from 'daisyui'
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
}

export default config
