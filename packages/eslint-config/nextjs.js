/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: ['./index.js', 'next/core-web-vitals'],
  rules: {
    // Força uso do componente <Image> do Next.js em vez de <img> puro
    // O <Image> do Next otimiza automaticamente: lazy load, WebP, tamanho responsivo
    '@next/next/no-img-element': 'error',
  },
};
