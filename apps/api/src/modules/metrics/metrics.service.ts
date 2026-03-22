import { Injectable, Logger } from '@nestjs/common';
import type { Metric } from '@prisma/client';

import { CacheService } from '../../cache/cache.service';
import { PrismaService } from '../../database/prisma.service';
import { GitHubService } from '../github/github.service';

/**
 * METRICS SERVICE
 *
 * Salva "fotos" periódicas do estado das métricas.
 * Isso permite o gráfico de evolução temporal no dashboard:
 * "Em janeiro você tinha X commits, em março Y commits."
 *
 * Analogia: é como tirar uma foto do painel do carro a cada 6 horas.
 * Com o tempo, você tem um álbum que mostra sua evolução.
 */
@Injectable()
export class MetricsService {
  private readonly logger = new Logger(MetricsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
    private readonly github: GitHubService,
  ) {}

  /**
   * findHistory — Retorna os últimos N snapshots para o gráfico de evolução
   */
  async findHistory(limit = 30): Promise<Metric[]> {
    return this.cache.getOrSet(
      `metrics:history:${limit}`,
      () =>
        this.prisma.metric.findMany({
          orderBy: { date: 'desc' },
          take: limit,
        }),
      CacheService.TTL.MEDIUM,
    );
  }

  /**
   * findLatest — Retorna o snapshot mais recente (para o dashboard)
   */
  async findLatest(): Promise<Metric | null> {
    return this.cache.getOrSet(
      'metrics:latest',
      () =>
        this.prisma.metric.findFirst({
          orderBy: { date: 'desc' },
        }),
      CacheService.TTL.SHORT,
    );
  }

  /**
   * saveSnapshot — Salva uma "foto" das métricas atuais
   * Chamado pelo cron job a cada 6 horas
   */
  async saveSnapshot(): Promise<Metric> {
    this.logger.log('Salvando snapshot de métricas...');

    const stats = await this.github.getFullStats();

    // Busca scores atuais de todas as skills
    const skills = await this.prisma.skill.findMany({
      select: { id: true, score: true },
    });

    const skillScores = skills.reduce<Record<string, number>>((acc, s) => {
      acc[s.id] = s.score;
      return acc;
    }, {});

    const snapshot = await this.prisma.metric.create({
      data: {
        totalCommits: stats.totalCommits,
        totalRepos: stats.repos.length,
        totalStars: stats.totalStars,
        topLanguages: stats.languageDistribution,
        skillScores,
      },
    });

    await this.cache.delByPattern('metrics:*');
    this.logger.log(`Snapshot salvo: ${snapshot.id}`);

    return snapshot;
  }
}
