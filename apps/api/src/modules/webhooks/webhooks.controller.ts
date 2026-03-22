import {
  Body,
  Controller,
  Headers,
  HttpCode,
  Post,
  RawBodyRequest,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyRequest } from 'fastify';

import { WebhooksService } from './webhooks.service';

@ApiTags('Webhooks')
@Controller('webhooks')
export class WebhooksController {
  constructor(private readonly webhooks: WebhooksService) {}

  @Post('github')
  @HttpCode(200)
  @ApiOperation({ summary: 'Endpoint receptor de webhooks do GitHub' })
  async handleGitHub(
    @Req() req: RawBodyRequest<FastifyRequest>,
    @Headers('x-github-event') event: string,
    @Headers('x-hub-signature-256') signature: string,
    @Body() payload: Record<string, unknown>,
  ): Promise<{ processed: boolean; message: string }> {
    // Valida assinatura antes de qualquer processamento
    const rawBody = req.rawBody?.toString() ?? JSON.stringify(payload);
    const isValid = this.webhooks.validateGitHubSignature(rawBody, signature);

    if (!isValid) {
      throw new UnauthorizedException('Assinatura do webhook inválida');
    }

    return this.webhooks.handleGitHubEvent(event, payload);
  }
}
