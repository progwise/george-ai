import { defineConfig } from '@tanstack/react-start/config'
import tsConfigPaths from 'vite-tsconfig-paths'

import './app/i18n/get-language'

export default defineConfig({
  server: {
    preset: 'node-server',
    experimental: {
      asyncContext: true,
    },
    esbuild: {
      options: {
        target: 'es2022',
      },
    },
  },
  vite: {
    build: {
      rollupOptions: {
        external: ['node:buffer', 'node:worker_threads', 'node:async_hooks'],
      },
    },
    plugins: [
      {
        name: 'report-hmr-ports',
        configureServer: ({ config }) => {
          const hmr = config.server.hmr
          if (typeof hmr === 'object' && 'port' in hmr) {
            console.log(`\x1b[34mHMR\x1b[0m is listening to \x1b[32mhttp://localhost:${hmr.port}\x1b[0m`)
          }
        },
      },
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
    ],
  },
})
