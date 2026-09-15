import { Module } from '@nestjs/common';
import { NfrsService } from './nfrs.service';
import { NfrsController } from './nfrs.controller';

@Module({
  controllers: [NfrsController],
  providers: [NfrsService],
})
export class NfrsModule {}
