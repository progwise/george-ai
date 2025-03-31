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
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        format: 'esm',
      },
      external: ['node:buffer', 'node:worker_threads', 'node:async_hooks', 'mupdf'],
    },
    commonjsOptions: {
      esmExternals: true,
    },
    outDir: './dist',
  },
})
