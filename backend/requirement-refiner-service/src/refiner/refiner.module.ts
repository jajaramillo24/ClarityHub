import { Module } from '@nestjs/common';
import { ClaudeModule } from '../claude/claude.module';
import { RefinerController } from './refiner.controller';

@Module({
  imports: [ClaudeModule],
  controllers: [RefinerController],
})
export class RefinerModule {}
