import react from '@eslint-react/eslint-plugin'
import js from '@eslint/js'
import pluginQuery from '@tanstack/eslint-plugin-query'
import pluginRouter from '@tanstack/eslint-plugin-router'
import eslintConfigPrettier from 'eslint-config-prettier'
import reactHooks from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

// TODO: clean up for better composability
export default tseslint.config(
  {
    ignores: [
      'dist',
      '.vinxi',
      '.wrangler',
      '.vercel',
      '.netlify',
      '.output',
      'build/',
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      eslintConfigPrettier,
      ...pluginQuery.configs['flat/recommended'],
      ...pluginRouter.configs['flat/recommended'],
    ],
  },
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    ...react.configs['recommended-type-checked'],
  },
  {
    rules: {
      // You can override any rules here
      // "@eslint-react/prefer-read-only-props": "off",
    },
  },
)
