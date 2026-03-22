import * as crypto from 'crypto';

import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '../../database/prisma.service';
import { GitHubService } from '../github/github.service';
import { SkillsService } from '../skills/skills.service';

/**
 * WEBHOOKS SERVICE
 *
 * O que é um webhook?
 * Em vez de você perguntar "tem novidade?" a cada X minutos (polling),
 * o GitHub te AVISA quando algo acontece (push, star, fork).
 * É como a diferença entre você ligar para o banco todo dia perguntando
 * se chegou um boleto, ou o banco te enviar um email quando chegar.
 *
 * Como funciona a segurança?
 * O GitHub assina cada requisição com um HMAC-SHA256 usando o WEBHOOK_SECRET.
 * Validamos essa assinatura antes de processar qualquer coisa.
 * Sem essa validação, qualquer pessoa poderia chamar nosso endpoint.
 */
@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly github: GitHubService,
    private readonly skills: SkillsService,
  ) {}

  /**
   * validateGitHubSignature — Verifica se o webhook veio realmente do GitHub
   *
   * GitHub envia um header: X-Hub-Signature-256: sha256=<hash>
   * Recalculamos o hash com nosso secret e comparamos.
   * Se forem iguais, é legítimo.
   */
  validateGitHubSignature(payload: string, signature: string): boolean {
    const secret = this.config.get<string>('WEBHOOK_SECRET');
    if (!secret) {
      this.logger.warn('WEBHOOK_SECRET não configurado — pulando validação');
      return true;
    }

    const expectedSig = `sha256=${crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex')}`;

    // timingSafeEqual previne timing attacks
    // (comparação normal pode vazar informações pelo tempo de resposta)
    try {
      return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSig),
      );
    } catch {
      return false;
    }
  }

  async handleGitHubEvent(
    event: string,
    payload: Record<string, unknown>,
  ): Promise<{ processed: boolean; message: string }> {
    // Loga o evento recebido para auditoria
    await this.prisma.webhookLog.create({
      data: {
        source: 'github',
        event,
        payload,
        processed: false,
      },
    });

    this.logger.log(`Webhook GitHub recebido: ${event}`);

    switch (event) {
      case 'push':
        // Push novo = invalida cache do GitHub e re-sincroniza skills
        await this.github.invalidateCache();
        await this.skills.syncFromGitHub();
        await this.prisma.webhookLog.updateMany({
          where: { event: 'push', processed: false },
          data: { processed: true },
        });
        return { processed: true, message: 'Cache invalidado e skills sincronizadas' };

      case 'ping':
        // GitHub envia um ping ao configurar o webhook — apenas confirmamos
        return { processed: true, message: 'pong' };

      default:
        this.logger.debug(`Evento ${event} ignorado`);
        return { processed: false, message: `Evento ${event} não tratado` };
    }
  }
}
