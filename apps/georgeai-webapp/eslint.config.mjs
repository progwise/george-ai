import react from '@eslint-react/eslint-plugin'
import js from '@eslint/js'
import tanstackQuery from '@tanstack/eslint-plugin-query'
import tanstackRouter from '@tanstack/eslint-plugin-router'
import reactHooks from 'eslint-plugin-react-hooks'
import { defineConfig, globalIgnores } from 'eslint/config'
import typescript from 'typescript-eslint'
import tailwind from 'eslint-plugin-better-tailwindcss'

export default defineConfig(globalIgnores(['dist/', '.nitro/', '.turbo/', '.output/', '.tanstack/', 'src/gql/']), {
  files: ['**/*.{ts,tsx}'],

  extends: [
    js.configs.recommended,
    typescript.configs.recommended,
    react.configs['recommended-typescript'],
    reactHooks.configs.flat['recommended-latest'],
    tanstackQuery.configs['flat/recommended'],
    tanstackRouter.configs['flat/recommended'],
  ],
  // Configure language/parsing options
  languageOptions: {
    // Use TypeScript ESLint parser for TypeScript files
    parser: typescript.parser,
    parserOptions: {
      // Enable project service for better TypeScript integration
      projectService: true,
      tsconfigRootDir: import.meta.dirname,
    },
  },
  plugins: {
    'better-tailwindcss': tailwind,
  },

  rules: {
    ...tailwind.configs['recommended'].rules,
    'better-tailwindcss/enforce-consistent-line-wrapping': 'off',
  },
  settings: {
    'better-tailwindcss': {
      entryPoint: 'src/index.css',
      ignore,
    },
  },
})
