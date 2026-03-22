# =============================================================================
# api.Dockerfile — NestJS
#
# MULTI-STAGE BUILD: 3 estágios
#
# 1. deps     → instala dependências
# 2. builder  → compila TypeScript → JavaScript (NestJS roda JS em produção)
# 3. runner   → imagem leve com apenas o JS compilado + deps de produção
# =============================================================================

# ---- ESTÁGIO 1: Base --------------------------------------------------------
FROM node:20-alpine AS base

RUN npm install -g pnpm@9

WORKDIR /app

COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY turbo.json ./

# ---- ESTÁGIO 2: Dependências ------------------------------------------------
FROM base AS deps

COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY apps/api/package.json ./apps/api/

RUN pnpm install --frozen-lockfile

# ---- ESTÁGIO 3: Build -------------------------------------------------------
FROM base AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

COPY packages/ ./packages/
COPY apps/api/ ./apps/api/

# Gera o Prisma Client a partir do schema
# Precisa acontecer ANTES do build do NestJS
RUN pnpm --filter @portfolio/api prisma generate

# Compila TypeScript → JavaScript
RUN pnpm --filter @portfolio/api build

# Remove dependências de desenvolvimento
# Deixa só as de produção para copiar na próxima etapa
RUN pnpm --filter @portfolio/api install --prod --frozen-lockfile

# ---- ESTÁGIO 4: Runner (imagem final) ---------------------------------------
FROM node:20-alpine AS runner

# Instala dependências de sistema necessárias para o Prisma
RUN apk add --no-cache openssl

WORKDIR /app

# Usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# Copia apenas o necessário
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/src/database/schema.prisma ./prisma/schema.prisma

USER nestjs

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001

# Roda migrations antes de iniciar (garante banco sempre atualizado)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
