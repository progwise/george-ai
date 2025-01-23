import { defineConfig } from '@tanstack/start/config'
import { reportPorts } from './report-ports'

export default defineConfig({
  server: {
    preset: 'node-server',
  },

  vite: {
    plugins: [
      {
        name: 'report-ports',
        configureServer: () => {
          reportPorts().then((ports) => {
            ports.forEach((port) => {
              console.log(`Listening to http://localhost:${port} `)
            })
          })
        },
      },
    ],
  },
})
