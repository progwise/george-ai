import eslint from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import { defineConfig } from 'eslint/config'
import tseslint from 'typescript-eslint'

export default defineConfig(
  // 1. Global ignores must be in their own object at the top level
  {
    ignores: ['**/dist/**', 'dist/'],
  },
  // 2. Then we can have overrides for specific file types
  {
    files: ['**/*.{ts,tsx}'],
    extends: [eslint.configs.recommended, tseslint.configs.recommended],
    plugins: {
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          typescript: { projectService: true },
        },
      },
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'import/no-unresolved': 'error',
    },
  },
)
