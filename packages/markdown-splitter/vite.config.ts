import { defineConfig } from 'vitest/config'

import 'dotenv/config'

export default defineConfig({
  test: {
    globals: true,
    clearMocks: true,
    testTimeout: 300_000,
  },
})
