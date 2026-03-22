/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    /**
     * Tipos de commit permitidos:
     *
     * feat     → nova funcionalidade  (ex: feat: adiciona seção de projetos)
     * fix      → correção de bug      (ex: fix: corrige layout mobile)
     * docs     → documentação         (ex: docs: atualiza README)
     * style    → formatação pura      (ex: style: ajusta indentação)
     * refactor → refatoração          (ex: refactor: extrai hook useGitHub)
     * test     → testes               (ex: test: adiciona testes do módulo skills)
     * chore    → manutenção           (ex: chore: atualiza dependências)
     * perf     → performance          (ex: perf: adiciona cache no endpoint)
     * ci       → CI/CD                (ex: ci: adiciona step de deploy)
     * revert   → reverter commit      (ex: revert: desfaz feat de webhooks)
     */
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'perf', 'ci', 'revert'],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'header-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 120],
  },
};
