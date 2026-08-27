import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Nfr } from './nfr.entity';
import { NfrsService } from './nfrs.service';
import { NfrsController } from './nfrs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Nfr])],
  controllers: [NfrsController],
  providers: [NfrsService],
})
export class NfrsModule {}
