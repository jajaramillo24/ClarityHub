import { Module } from '@nestjs/common';
import { ClaudeService } from './claude.service';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [DocumentsModule],
  providers: [ClaudeService],
  exports: [ClaudeService],
})
export class ClaudeModule {}
