/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['./index.js'],
  rules: {
    /**
     * NestJS usa decorators (@Controller, @Injectable, @Get...) de forma extensiva.
     * Algumas regras de type-checking são incompatíveis com esse padrão,
     * então desativamos só as que causam falsos positivos.
     */
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
  },
};
