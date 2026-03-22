import { Module } from '@nestjs/common';

import { GitHubModule } from '../github/github.module';
import { SkillsModule } from '../skills/skills.module';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

@Module({
  imports: [GitHubModule, SkillsModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
