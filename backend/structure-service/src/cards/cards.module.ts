import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectCard } from './project-card.entity';
import { Subtask } from './subtask.entity';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProjectCard, Subtask])],
  controllers: [CardsController],
  providers: [CardsService],
})
export class CardsModule {}
