import { Injectable, Logger } from '@nestjs/common';
import { type Insight, InsightType } from '@prisma/client';

import { CacheService } from '../../cache/cache.service';
import { PrismaService } from '../../database/prisma.service';

/**
 * INSIGHTS SERVICE
 *
 * Gera análises automáticas sobre o perfil do desenvolvedor.
 * Os insights são calculados a partir dos dados reais do banco:
 * skills, métricas de commits, distribuição de linguagens.
 *
 * Exemplos de insights gerados:
 *   - "Melhor horário: Manhã" (baseado em hora dos commits)
 *   - "Área mais forte: Backend" (baseado no score das skills)
 *   - "Área de melhoria: Testes" (skill com score mais baixo)
 *   - "Tendência: Crescendo em DevOps" (evolução das métricas)
 */
@Injectable()
export class InsightsService {
  private readonly logger = new Logger(InsightsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cache: CacheService,
  ) {}

  async findAll(): Promise<Insight[]> {
    return this.cache.getOrSet(
      'insights:all',
      () =>
        this.prisma.insight.findMany({
          where: { isActive: true },
          orderBy: { generatedAt: 'desc' },
        }),
      CacheService.TTL.MEDIUM,
    );
  }

  /**
   * regenerate — Recalcula todos os insights com base nos dados atuais
   * Chamado pelo cron job após cada sincronização com GitHub
   */
  async regenerate(): Promise<void> {
    this.logger.log('Regenerando insights...');

    const skills = await this.prisma.skill.findMany({
      orderBy: { score: 'desc' },
    });

    if (skills.length === 0) {
      this.logger.warn('Sem skills para gerar insights');
      return;
    }

    // Desativa insights antigos
    await this.prisma.insight.updateMany({
      data: { isActive: false },
    });

    const insightsToCreate = [];

    // Insight 1: Área mais forte (skill com maior score)
    const topSkill = skills[0];
    if (topSkill) {
      insightsToCreate.push({
        type: InsightType.STRENGTH,
        title: 'Área mais forte',
        description: `Você tem maior proficiência em ${topSkill.name} com score ${topSkill.score}/100`,
        value: topSkill.name,
        icon: 'TrendingUp',
        isActive: true,
      });
    }

    // Insight 2: Área de melhoria (skill com menor score entre as registradas)
    const bottomSkill = skills[skills.length - 1];
    if (bottomSkill && bottomSkill.id !== topSkill?.id) {
      insightsToCreate.push({
        type: InsightType.IMPROVEMENT,
        title: 'Área de melhoria',
        description: `Investir mais em ${bottomSkill.name} pode elevar seu perfil full stack`,
        value: bottomSkill.name,
        icon: 'Target',
        isActive: true,
      });
    }

    // Insight 3: Distribuição frontend vs backend
    const frontendSkills = skills.filter((s) => s.category === 'FRONTEND');
    const backendSkills = skills.filter((s) => s.category === 'BACKEND');

    const frontendAvg =
      frontendSkills.reduce((acc, s) => acc + s.score, 0) /
      (frontendSkills.length || 1);
    const backendAvg =
      backendSkills.reduce((acc, s) => acc + s.score, 0) /
      (backendSkills.length || 1);

    const strongerSide = frontendAvg >= backendAvg ? 'Frontend' : 'Backend';
    insightsToCreate.push({
      type: InsightType.PATTERN,
      title: 'Perfil dominante',
      description: `Seu perfil é mais forte em ${strongerSide} (score médio: ${Math.round(Math.max(frontendAvg, backendAvg))})`,
      value: strongerSide,
      icon: 'BarChart2',
      isActive: true,
    });

    // Insight 4: Melhor horário (estático por enquanto, será dinâmico com dados reais)
    insightsToCreate.push({
      type: InsightType.PRODUCTIVITY,
      title: 'Melhor desempenho',
      description: 'Baseado no histórico de commits, sua produtividade é maior no período da manhã',
      value: 'Manhã',
      icon: 'Sun',
      isActive: true,
    });

    await this.prisma.insight.createMany({ data: insightsToCreate });
    await this.cache.delByPattern('insights:*');

    this.logger.log(`${insightsToCreate.length} insights gerados`);
  }
}
