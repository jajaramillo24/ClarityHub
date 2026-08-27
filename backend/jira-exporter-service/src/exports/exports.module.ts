import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportJob } from './export-job.entity';
import { ExportsService } from './exports.service';
import { ExportsController } from './exports.controller';
import { StructureClientModule } from '../structure-client/structure-client.module';

@Module({
  imports: [TypeOrmModule.forFeature([ExportJob]), StructureClientModule],
  controllers: [ExportsController],
  providers: [ExportsService],
})
export class ExportsModule {}
