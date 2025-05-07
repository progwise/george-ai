import { defineConfig } from 'vitest/config'

import 'dotenv/config'

export default defineConfig({
  test: {
    globals: true,
    globalSetup: 'src/testing/global-setup.ts',
    setupFiles: 'src/testing/setup.ts',
    clearMocks: true,
  },
})
