import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { GitHubController } from './github.controller';
import { GitHubService } from './github.service';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'https://api.github.com',
      timeout: 10000,
    }),
  ],
  controllers: [GitHubController],
  providers: [GitHubService],
  exports: [GitHubService], // exporta para outros módulos usarem (Skills, Jobs)
})
export class GitHubModule {}
