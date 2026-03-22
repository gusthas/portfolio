import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * CACHE SERVICE — Abstração sobre o Redis
 *
 * Por que ter uma abstração em vez de usar o Redis diretamente?
 * Se um dia quisermos trocar o Redis por outro sistema de cache,
 * mudamos AQUI — nenhum outro serviço precisa saber.
 *
 * Padrão de uso (Cache-Aside):
 *   1. Busca no cache (Redis)
 *   2. Se existe (cache hit) → retorna imediatamente
 *   3. Se não existe (cache miss) → busca no banco → salva no cache → retorna
 *
 * TTL (Time To Live) = tempo de vida da entrada no cache.
 * Após o TTL, o Redis deleta automaticamente.
 */
@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(CacheService.name);
  private client: Redis;

  // TTLs padrão em segundos
  static readonly TTL = {
    SHORT: 60 * 5,        // 5 minutos — dados que mudam com frequência
    MEDIUM: 60 * 30,      // 30 minutos — dados semi-estáticos
    LONG: 60 * 60 * 6,    // 6 horas — dados do GitHub (respeitando rate limit)
    VERY_LONG: 60 * 60 * 24, // 24 horas — dados que raramente mudam
  } as const;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    this.client = new Redis(this.config.get<string>('REDIS_URL') ?? 'redis://localhost:6379', {
      retryStrategy: (times) => Math.min(times * 100, 3000), // retry com backoff
      maxRetriesPerRequest: 3,
    });

    this.client.on('connect', () => this.logger.log('Conectado ao Redis'));
    this.client.on('error', (err) => this.logger.error('Erro no Redis:', err));
  }

  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  /**
   * get<T> — Busca um valor no cache
   * Retorna null se não existir ou se expirou
   */
  async get<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }

  /**
   * set — Salva um valor no cache com TTL
   */
  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    await this.client.setex(key, ttlSeconds, JSON.stringify(value));
  }

  /**
   * del — Remove um ou mais valores do cache
   * Útil para invalidar cache após uma atualização
   */
  async del(...keys: string[]): Promise<void> {
    if (keys.length > 0) {
      await this.client.del(...keys);
    }
  }

  /**
   * delByPattern — Remove todas as chaves que correspondem a um padrão
   * Ex: delByPattern('skills:*') remove todas as chaves de skills
   *
   * ATENÇÃO: KEYS é O(N) — use com cuidado em produção com muitas chaves
   */
  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.client.keys(pattern);
    if (keys.length > 0) {
      await this.client.del(...keys);
      this.logger.debug(`Cache invalidado: ${keys.length} chaves (${pattern})`);
    }
  }

  /**
   * getOrSet — Padrão Cache-Aside em uma linha
   *
   * Uso:
   *   const skills = await cache.getOrSet(
   *     'skills:all',
   *     () => prisma.skill.findMany(),  // só executa se não tiver cache
   *     CacheService.TTL.LONG
   *   )
   */
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      this.logger.debug(`Cache hit: ${key}`);
      return cached;
    }

    this.logger.debug(`Cache miss: ${key} — buscando dados...`);
    const fresh = await fetcher();
    await this.set(key, fresh, ttlSeconds);
    return fresh;
  }
}
