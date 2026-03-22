# ADR-003: Docker com Multi-stage Build e Docker Compose

**Status:** Aceito  
**Data:** 2024

---

## Contexto

Precisamos de um ambiente de desenvolvimento reproduzível e uma estratégia de deploy consistente entre dev, staging e produção.

## Decisão

Usamos **Docker com multi-stage build** para cada aplicação e **Docker Compose** para orquestrar os serviços localmente.

## Consequências positivas

- "Funciona na minha máquina" deixa de ser um problema
- Imagens de produção são leves (~200MB vs ~1.5GB sem multi-stage)
- `docker-compose up` sobe todo o ambiente em um comando
- Dev e produção usam as mesmas versões de PostgreSQL, Redis, Node
- Usuário não-root dentro dos containers (segurança)

## Consequências negativas / trade-offs

- Primeira build é mais lenta (baixa imagens base)
- Builds subsequentes são rápidas (Docker usa cache de layers)
- Em dev, hot reload via volumes funciona bem, mas tem um overhead leve vs rodar sem Docker

## Alternativas consideradas

- **Sem Docker (bare metal)**: descartado por criar dependência de ambiente local
- **Kubernetes**: descartado por ser overkill para um portfólio; Kubernetes faz sentido para times e microsserviços em escala
- **Docker Swarm**: considerado, mas Docker Compose é suficiente para esse projeto
