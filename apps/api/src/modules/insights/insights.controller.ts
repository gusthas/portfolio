import { Controller, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Insight } from '@prisma/client';

import { InsightsService } from './insights.service';

@ApiTags('Insights')
@Controller('insights')
export class InsightsController {
  constructor(private readonly insights: InsightsService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os insights ativos' })
  async findAll(): Promise<Insight[]> {
    return this.insights.findAll();
  }

  @Post('regenerate')
  @ApiOperation({ summary: 'Força regeneração dos insights (admin)' })
  async regenerate(): Promise<{ message: string }> {
    await this.insights.regenerate();
    return { message: 'Insights regenerados com sucesso' };
  }
}
