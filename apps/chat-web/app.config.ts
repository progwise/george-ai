import { defineConfig } from '@tanstack/start/config'

export default defineConfig({
  server: {
    preset: 'node-server',
  },
  vite: {
    plugins: [
      {
        name: 'report-hmr-ports',
        configureServer: ({ config }) => {
          const hmr = config.server.hmr
          if (typeof hmr === 'object' && 'port' in hmr) {
            console.log(
              `\x1b[34mHMR\x1b[0m is listening to \x1b[32mhttp://localhost:${hmr.port}\x1b[0m`,
            )
          }
        },
      },
    ],
  },
})
