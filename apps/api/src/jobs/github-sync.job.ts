import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { GitHubService } from '../modules/github/github.service';
import { InsightsService } from '../modules/insights/insights.service';
import { MetricsService } from '../modules/metrics/metrics.service';
import { SkillsService } from '../modules/skills/skills.service';

/**
 * GITHUB SYNC JOB — Cron job de sincronização automática
 *
 * O que são cron jobs?
 * São tarefas agendadas que rodam automaticamente em intervalos definidos.
 * Como um alarme: você define "rode isso toda segunda-feira às 8h" e ele roda.
 *
 * Por que rodar a cada 6 horas?
 * - Rate limit do GitHub: 5.000 req/hora com token
 * - Dados de portfólio não mudam com segundos de diferença
 * - Usuário sempre vê dados frescos sem impacto no rate limit
 *
 * Analogia: é como um jornaleiro que passa a cada 6 horas deixando
 * o jornal mais atualizado, em vez de você sair correndo comprar um
 * jornal novo toda vez que alguém pergunta "tem novidades?".
 */
@Injectable()
export class GitHubSyncJob {
  private readonly logger = new Logger(GitHubSyncJob.name);

  constructor(
    private readonly github: GitHubService,
    private readonly skills: SkillsService,
    private readonly metrics: MetricsService,
    private readonly insights: InsightsService,
  ) {}

  /**
   * Roda a cada 6 horas
   * CronExpression.EVERY_6_HOURS = "0 */6 * * *"
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async syncGitHubData(): Promise<void> {
    this.logger.log('🔄 Iniciando sincronização com GitHub...');
    const startTime = Date.now();

    try {
      // 1. Invalida cache para forçar dados frescos
      await this.github.invalidateCache();

      // 2. Sincroniza skills com dados reais
      await this.skills.syncFromGitHub();

      // 3. Salva snapshot de métricas (histórico de evolução)
      await this.metrics.saveSnapshot();

      // 4. Regera insights baseados nos novos dados
      await this.insights.regenerate();

      const elapsed = Date.now() - startTime;
      this.logger.log(`✅ Sincronização concluída em ${elapsed}ms`);
    } catch (error) {
      this.logger.error('❌ Erro na sincronização:', error);
      // Não lança o erro — o job continua agendado para a próxima execução
    }
  }

  /**
   * Roda uma vez ao iniciar a aplicação (após 10 segundos)
   * Garante que os dados estão atualizados logo na primeira carga
   */
  @Cron(new Date(Date.now() + 10_000))
  async initialSync(): Promise<void> {
    this.logger.log('🚀 Sincronização inicial ao iniciar a aplicação...');
    await this.syncGitHubData();
  }
}
