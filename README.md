# 🚀 Portfolio — Full Stack

Portfólio interativo com dashboard de métricas reais, sistema de habilidades gamificado, integração com APIs externas e infraestrutura de nível profissional.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | NestJS + Fastify |
| Banco de dados | PostgreSQL + Prisma ORM |
| Cache | Redis |
| Filas | BullMQ |
| Infra | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Testes | Vitest + Playwright |
| i18n | next-intl (PT-BR + EN) |
| Docs UI | Storybook |
| Docs API | Swagger / OpenAPI |

## Pré-requisitos

- Node.js >= 20
- pnpm >= 9
- Docker + Docker Compose

## Como rodar

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/portfolio.git
cd portfolio

# 2. Instale as dependências
pnpm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas chaves de API

# 4. Suba os serviços (banco, redis)
docker-compose up -d postgres redis

# 5. Rode as migrations
pnpm --filter @portfolio/api prisma migrate dev

# 6. Inicie o desenvolvimento
pnpm dev
```

Acesse:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Swagger**: http://localhost:3001/docs
- **Storybook**: http://localhost:6006

## Estrutura do projeto

```
portfolio/
├── apps/
│   ├── web/        → Next.js (frontend)
│   └── api/        → NestJS (backend)
├── packages/
│   ├── ui/         → Design System
│   ├── eslint-config/
│   └── tsconfig/
├── infra/docker/   → Dockerfiles
├── docs/decisions/ → Architecture Decision Records
└── .github/        → CI/CD
```

## Convenção de commits

```
feat: nova funcionalidade
fix: correção de bug
docs: documentação
refactor: refatoração sem mudança de comportamento
test: adição ou correção de testes
chore: manutenção (deps, configs)
perf: melhoria de performance
ci: mudanças de CI/CD
```

## Licença

MIT
