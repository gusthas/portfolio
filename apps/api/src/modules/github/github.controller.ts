import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { type GitHubStats, GitHubService } from './github.service';

@ApiTags('GitHub')
@Controller('github')
export class GitHubController {
  constructor(private readonly github: GitHubService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Retorna todas as métricas do GitHub' })
  async getStats(): Promise<GitHubStats> {
    return this.github.getFullStats();
  }
}
