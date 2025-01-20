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
  ssr: {
    // noExternal: [
    //   '@george-ai/pothos-graphql',
    //   '@pothos/core',
    //   '@pothos/plugin-simple-objects',
    //   '@pothos/plugin-prisma',
    // ],
    target: 'node',
    noExternal: true,
    // optimizeDeps: {
    //   exclude: [
    //     '@george-ai/pothos-graphql',
    //     '@pothos/core',
    //     '@pothos/plugin-simple-objects',
    //     '@pothos/plugin-prisma',
    //   ],
    // },
  },
})
