import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

import { AppController } from './app.controller';
import { CacheModule } from './cache/cache.module';
import { DatabaseModule } from './database/database.module';
import { GitHubModule } from './modules/github/github.module';
import { HobbiesModule } from './modules/hobbies/hobbies.module';
import { InsightsModule } from './modules/insights/insights.module';
import { MetricsModule } from './modules/metrics/metrics.module';
import { SkillsModule } from './modules/skills/skills.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';

/**
 * APP MODULE — O módulo raiz
 *
 * Analogia: é a recepção principal do hospital.
 * Registra todos os departamentos e serviços globais.
 *
 * ConfigModule.forRoot() → lê o arquivo .env e disponibiliza via ConfigService
 *   isGlobal: true → qualquer módulo pode injetar ConfigService sem reimportar
 *
 * ScheduleModule.forRoot() → habilita cron jobs (@Cron decorator)
 */
@Module({
  imports: [
    // Configuração global — lê variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Habilita @Cron decorators para jobs agendados
    ScheduleModule.forRoot(),

    // Infraestrutura
    DatabaseModule,
    CacheModule,

    // Módulos de negócio
    GitHubModule,
    SkillsModule,
    HobbiesModule,
    MetricsModule,
    InsightsModule,
    WebhooksModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
