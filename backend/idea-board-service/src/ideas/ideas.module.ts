import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Idea } from './idea.entity';
import { IdeasService } from './ideas.service';
import { IdeasController } from './ideas.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Idea])],
  controllers: [IdeasController],
  providers: [IdeasService],
})
export class IdeasModule {}
