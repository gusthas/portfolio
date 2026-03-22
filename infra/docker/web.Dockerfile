# =============================================================================
# web.Dockerfile — Next.js
#
# MULTI-STAGE BUILD: 3 estágios
#
# 1. base      → instala dependências (pesado, só para build)
# 2. builder   → compila o TypeScript e gera o .next
# 3. runner    → imagem final leve com só o necessário para rodar
#
# Por que isso importa?
# Sem multi-stage: ~1.5GB de imagem (inclui node_modules de dev, TypeScript, etc.)
# Com multi-stage:  ~200MB de imagem (só o código compilado + deps de produção)
# =============================================================================

# ---- ESTÁGIO 1: Base --------------------------------------------------------
FROM node:20-alpine AS base

# Instala pnpm globalmente
RUN npm install -g pnpm@9

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de definição de workspace
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY turbo.json ./

# ---- ESTÁGIO 2: Instalação de dependências ----------------------------------
FROM base AS deps

# Copia todos os package.json dos pacotes (necessário para o pnpm resolver o workspace)
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/ui/package.json ./packages/ui/
COPY apps/web/package.json ./apps/web/

# Instala TODAS as dependências (incluindo dev) — necessário para o build
RUN pnpm install --frozen-lockfile

# ---- ESTÁGIO 3: Build -------------------------------------------------------
FROM base AS builder

WORKDIR /app

# Copia as dependências instaladas do estágio anterior
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules

# Copia todo o código fonte
COPY packages/ ./packages/
COPY apps/web/ ./apps/web/

# Variáveis de ambiente necessárias DURANTE o build
# (Next.js injeta NEXT_PUBLIC_* no bundle em tempo de build)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

# Compila o Next.js
# O output "standalone" copia só o necessário para produção
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm --filter @portfolio/web build

# ---- ESTÁGIO 4: Runner (imagem final) ---------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Cria usuário não-root para segurança
# Nunca rode containers como root em produção
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copia apenas os arquivos necessários para rodar
COPY --from=builder /app/apps/web/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

CMD ["node", "server.js"]
