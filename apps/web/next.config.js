/** @type {import('next').NextConfig} */
const nextConfig = {
  // Transpila pacotes internos do monorepo
  transpilePackages: ['@portfolio/ui'],

  images: {
    remotePatterns: [
      // GitHub avatars e imagens de repos
      { protocol: 'https', hostname: 'avatars.githubusercontent.com' },
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
      // RAWG (jogos)
      { protocol: 'https', hostname: 'media.rawg.io' },
      // Google Books
      { protocol: 'https', hostname: 'books.google.com' },
      { protocol: 'https', hostname: 'covers.openlibrary.org' },
    ],
  },

  // Variáveis públicas expostas ao browser (prefixo NEXT_PUBLIC_)
  // Variáveis sem esse prefixo ficam apenas no servidor — nunca vão ao cliente
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
};

module.exports = nextConfig;
