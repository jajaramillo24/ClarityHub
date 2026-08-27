import { Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { IdeasProxyController } from './ideas.controller';
import { AttachmentsProxyController } from './attachments.controller';
import { CardsProxyController } from './cards.controller';
import { ExportsProxyController } from './exports.controller';

@Module({
  controllers: [
    IdeasProxyController,
    AttachmentsProxyController,
    CardsProxyController,
    ExportsProxyController,
  ],
  providers: [ProxyService],
})
export class ProxyModule {}
