import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

/**
 * APP CONTROLLER — Endpoints raiz da API
 *
 * O health check é um endpoint padrão de infraestrutura.
 * Docker, AWS, Kubernetes e load balancers chamam esse endpoint
 * periodicamente para saber se a aplicação está viva.
 * Se retornar erro, o orquestrador reinicia o container automaticamente.
 */
@ApiTags('Health')
@Controller()
export class AppController {
  @Get('health')
  @ApiOperation({ summary: 'Health check — verifica se a API está no ar' })
  health(): { status: string; timestamp: string; uptime: number } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(), // segundos rodando
    };
  }
}
