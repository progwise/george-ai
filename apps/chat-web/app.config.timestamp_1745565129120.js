// app.config.ts
import { defineConfig } from '@tanstack/react-start/config'
import tsConfigPaths from 'vite-tsconfig-paths'

var app_config_default = defineConfig({
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
            console.log(`\x1B[34mHMR\x1B[0m is listening to \x1B[32mhttp://localhost:${hmr.port}\x1B[0m`)
          }
        },
      },
      tsConfigPaths({
        projects: ['./tsconfig.json'],
      }),
    ],
  },
})
export { app_config_default as default }
