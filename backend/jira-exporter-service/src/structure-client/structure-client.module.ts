import { Module } from '@nestjs/common';
import { StructureClientService } from './structure-client.service';

@Module({
  providers: [StructureClientService],
  exports: [StructureClientService],
})
export class StructureClientModule {}
