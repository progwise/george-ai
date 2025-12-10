import tailwindcss from '@tailwindcss/vite'
import { nitroV2Plugin } from '@tanstack/nitro-v2-vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  server: {
    port: 3001,
  },
  plugins: [
    tsConfigPaths({
      projects: ['./tsconfig.json'],
    }),
    tanstackStart({}),
    tailwindcss(),
    // Enable serving static assets from .output/public in production
    // The node preset does NOT have serveStatic enabled by default
    nitroV2Plugin({ serveStatic: true }),
    viteReact(),
  ],
})
