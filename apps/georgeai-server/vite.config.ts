import { defineConfig } from 'vite'
import { VitePluginNode } from 'vite-plugin-node'

export default defineConfig({
  // ...vite configures
  server: {
    // vite server configs, for details see [vite doc](https://vitejs.dev/config/#server-host)
    port: 3003,
  },
  plugins: [
    VitePluginNode({
      adapter: 'express',
      appPath: './src/server.ts',
      tsCompiler: 'esbuild',
    }),
    {
      name: 'vite-plugin-node-restart',
      apply: 'serve',
      configureServer(server) {
        server.watcher.on('all', (event, path) => {
          if (!path.endsWith('.ts') && !path.endsWith('.js')) return
          console.log('File change detected, restarting server...')
          console.log(`Event: ${event}, Path: ${path}`)
          server.restart()
        })
      },
    },
  ],
})
