import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import { defineConfig } from "eslint/config";


export default defineConfig(
  {
    ignores: ['dist'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [eslint.configs.recommended, tseslint.configs.recommended],
  },
)
