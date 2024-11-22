/* eslint-disable import/no-anonymous-default-export */
import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.{ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
}
