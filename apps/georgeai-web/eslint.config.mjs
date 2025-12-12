import js from '@eslint/js'
import astro from 'eslint-plugin-astro'
import tailwind from 'eslint-plugin-better-tailwindcss'
import { defineConfig, globalIgnores } from 'eslint/config'
import typescript from 'typescript-eslint'

export default defineConfig(globalIgnores(['dist/', '.astro/', '.turbo/']), {
  files: ['**/*.{ts,tsx}'],

  extends: [js.configs.recommended, typescript.configs.recommended, astro.configs['flat/recommended']],
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
    'better-tailwindcss/no-unknown-classes': [
      'error',
      {
        ignore: [
          'tab-active',
          'dock-label',
          'dropdown-content',
          'dropdown-hover',
          'drawer-overlay',
          'list-row',
          'properties',
          'table-pin-rows',
          'table-pin-cols',
        ],
      },
    ],
  },
  settings: {
    'better-tailwindcss': {
      entryPoint: 'src/styles/global.css',
    },
  },
})
