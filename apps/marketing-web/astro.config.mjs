// @ts-check
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import node from '@astrojs/node'

// https://astro.build/config
export default defineConfig({
  site: 'https://george-ai.net',
  output: 'static',
  integrations: [sitemap()],
  // Node adapter is required for Astro Actions to work at runtime
  // Even with output: 'static', the adapter enables server endpoints for actions (e.g., contact form)
  adapter: node({
    mode: 'standalone',
  }),

  vite: {
    plugins: [tailwindcss()],
  },
})