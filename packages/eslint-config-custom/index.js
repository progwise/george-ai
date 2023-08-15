module.exports = {
  extends: ['next', 'turbo', 'plugin:unicorn/recommended'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
    'turbo/no-undeclared-env-vars': 'off',
    'unicorn/prevent-abbreviations': [
      'error',
      { allowList: { props: true, Props: true } },
    ],
  },
  plugins: ['unicorn'],
}
