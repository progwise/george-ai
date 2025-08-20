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
      external: ['canvas', '@napi-rs/canvas'],
      plugins: [
        {
          name: 'prepare-package-json',
          generateBundle() {
            console.log('emitting package.json')
            this.emitFile({
              type: 'asset',
              fileName: 'package.json',
              source: `
{
  "name": "@george-ai/server-dist",
  "description": "This package is used for distributing the server code for George AI to dist folder. It is needed to install canvas for pdf2image to the server because it is not supported by default on the server.",
  "main": "./server.cjs",
  "author": "progwise.net",
  "private": true,
  "dependencies": {
    "canvas": "^3.1.0",
    "pdfjs-dist": "5.4.54"
  }
}
              `,
            })
          },
        },
      ],
    },
  },
  ssr: {
    target: 'node',
    noExternal: true,
  },
})
