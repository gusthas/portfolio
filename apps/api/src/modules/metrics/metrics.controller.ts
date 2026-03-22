import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Metric } from '@prisma/client';

import { MetricsService } from './metrics.service';

@ApiTags('Metrics')
@Controller('metrics')
export class MetricsController {
  constructor(private readonly metrics: MetricsService) {}

  @Get()
  @ApiOperation({ summary: 'Retorna histórico de métricas (snapshots temporais)' })
  async findAll(): Promise<Metric[]> {
    return this.metrics.findAll();
  }

  @Get('latest')
  @ApiOperation({ summary: 'Retorna o snapshot mais recente' })
  async findLatest(): Promise<Metric | null> {
    return this.metrics.findLatest();
  }
}
