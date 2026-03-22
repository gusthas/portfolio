# ADR-002: Next.js 14 com App Router

**Status:** Aceito  
**Data:** 2024

---

## Contexto

O frontend precisa de boa performance, SEO (para visibilidade do portfólio) e capacidade de buscar dados de múltiplas APIs.

## Decisão

Usamos **Next.js 14 com App Router** e **React Server Components (RSC)**.

## Consequências positivas

- Dados do GitHub, RAWG e Google Books buscados no servidor — usuário recebe página já renderizada
- SEO nativo — crawlers lêem o conteúdo sem executar JavaScript
- Sem waterfall de loading: não existe "carregando..." para dados iniciais
- Cache granular por rota e segmento
- Streaming com Suspense — partes da página carregam independentemente

## Consequências negativas / trade-offs

- Paradigma diferente do React tradicional — requer entender quando usar Server vs Client Components
- Menos bibliotecas compatíveis com RSC (algumas ainda assumem que tudo é Client)

## Alternativas consideradas

- **Vite + React SPA**: descartado por ausência de SSR nativo e SEO ruim
- **Next.js Pages Router**: descartado por ser o modelo legado — App Router é o futuro
- **Remix**: considerado, mas Next.js tem ecossistema maior e mais exemplos de portfólio
