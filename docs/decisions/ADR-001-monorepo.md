# ADR-001: Monorepo com Turborepo e pnpm

**Status:** Aceito  
**Data:** 2024  
**Decisores:** Equipe de desenvolvimento

---

## Contexto

O portfólio é composto por múltiplas aplicações (frontend Next.js, backend NestJS) e pacotes compartilhados (Design System, configurações). Precisamos de uma estratégia de organização de código.

## Decisão

Adotamos a estrutura de **Monorepo** gerenciado pelo **Turborepo**, com **pnpm** como gerenciador de pacotes.

## Consequências positivas

- Compartilhamento de código entre apps sem publicar pacotes no npm
- Alterações no Design System refletem em todas as apps imediatamente  
- Um único `pnpm install` instala tudo
- Turborepo faz cache de builds — se o código não mudou, não reconstrói
- Histórico de git unificado — fácil de ver o contexto completo de uma mudança

## Consequências negativas / trade-offs

- Curva de aprendizado inicial maior
- Clone do repositório é maior (contém tudo)

## Alternativas consideradas

- **Polyrepo (repos separados)**: descartado por aumentar fricção no desenvolvimento local e dificultar compartilhamento de código
- **Yarn Workspaces**: descartado em favor do pnpm por performance superior e melhor suporte a monorepos
