import eslint from '@eslint/js'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig({
  languageOptions: {
    parserOptions: {
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  ignores: ['dist'],
  files: ['**/*.{ts,tsx}'],
  extends: [eslint.configs.recommended, tseslint.configs.recommended],
})
