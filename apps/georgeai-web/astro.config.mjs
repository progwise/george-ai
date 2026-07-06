// @ts-check
import mdx from '@astrojs/mdx'
import node from '@astrojs/node'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, envField } from 'astro/config'

// https://astro.build/config
export default defineConfig({
  site: 'https://george-ai.net',
  output: 'static',
  integrations: [sitemap(), mdx()],
  // Node adapter is required for Astro Actions to work at runtime
  // Even with output: 'static', the adapter enables server endpoints for actions (e.g., contact form)
  adapter: node({
    mode: 'standalone',
  }),

  env: {
    schema: {
      WEBAPP_URL: envField.string({ context: 'server', access: 'public' }),
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },
})
