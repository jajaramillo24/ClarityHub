import { Module } from '@nestjs/common';
import { ExportsService } from './exports.service';
import { ExportsController } from './exports.controller';
import { StructureClientModule } from '../structure-client/structure-client.module';

@Module({
  imports: [StructureClientModule],
  controllers: [ExportsController],
  providers: [ExportsService],
})
export class ExportsModule {}
