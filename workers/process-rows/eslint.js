/** @type {import('eslint').Linter.Config } */
module.exports = {
  extends: ['@rocketseat/eslint-config/node'],
  plugins: ['simple-import-sort'],
  rules: {
    'simple-import-sort/imports': 'error',
    '@typescript-eslint/no-explicit-any': 'off',
    'no-useless-constructor': 'off',
  },
}
