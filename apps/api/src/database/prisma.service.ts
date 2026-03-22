import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PRISMA SERVICE
 *
 * Extende o PrismaClient oficial e adiciona dois comportamentos:
 *
 * OnModuleInit → conecta ao banco quando o módulo é inicializado
 *   (NestJS chama isso automaticamente na inicialização da app)
 *
 * OnModuleDestroy → desconecta graciosamente quando a app é encerrada
 *   Isso evita conexões "penduradas" no banco — importante para não
 *   esgotar o pool de conexões do PostgreSQL.
 *
 * Analogia: é o "porteiro do banco de dados". Abre a porta quando
 * precisamos entrar e fecha quando saímos, sem deixar a porta aberta.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['warn', 'error'],
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Conectado ao banco de dados');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Desconectado do banco de dados');
  }
}
