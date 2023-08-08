module.exports = {
  extends: ['next', 'turbo', 'plugin:unicorn/recommended'],
  rules: {
    '@next/next/no-html-link-for-pages': 'off',
  },
  plugins: ['unicorn'],
}
