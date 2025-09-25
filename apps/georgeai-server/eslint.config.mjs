import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default [
  {
    ignores: ['dist'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [eslint.configs.recommended, tseslint.configs.recommended],
  },
	{
	  parserOptions: {
		tsconfigRootDir: __dirname,
	  },
	},
]
