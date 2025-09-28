import eslint from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(
  {
    ignores: ['**/prisma/generated/**', '**/dist/**', '**/node_modules/**'],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
)
