/** @type {import("eslint").Linter.Config} */
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended-type-checked',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'prettier', // SEMPRE o último — desativa regras que conflitam com o Prettier
  ],
  rules: {
    /**
     * IMPORTAÇÕES
     * Garante que imports estejam sempre ordenados e sem ciclos.
     * Ciclos (A importa B que importa A) causam bugs silenciosos difíceis de debugar.
     */
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'import/no-cycle': 'error',
    'import/no-unused-modules': 'warn',

    /**
     * TYPESCRIPT
     * - no-unused-vars: ignora parâmetros prefixados com _ (convenção: _param = não usado intencionalmente)
     * - consistent-type-imports: separa imports de tipo dos de valor (melhor tree-shaking)
     * - no-explicit-any: proíbe 'any' — use tipos reais ou 'unknown'
     */
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
    '@typescript-eslint/no-explicit-any': 'error',
  },
};
