import { Module } from '@nestjs/common';
import { IdeasService } from './ideas.service';
import { IdeasController } from './ideas.controller';

@Module({
  controllers: [IdeasController],
  providers: [IdeasService],
})
export class IdeasModule {}
