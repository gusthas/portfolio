import { Module } from '@nestjs/common';

import { HobbiesController } from './hobbies.controller';
import { HobbiesService } from './hobbies.service';

@Module({
  controllers: [HobbiesController],
  providers: [HobbiesService],
  exports: [HobbiesService],
})
export class HobbiesModule {}
