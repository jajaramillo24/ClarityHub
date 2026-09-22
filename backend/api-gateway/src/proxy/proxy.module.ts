import { Module } from '@nestjs/common';
import { ProxyService } from './proxy.service';
import { IdeasProxyController } from './ideas.controller';
import { AttachmentsProxyController } from './attachments.controller';
import { CardsProxyController } from './cards.controller';
import { NfrsProxyController } from './nfrs.controller';
import { ExportsProxyController } from './exports.controller';
import { ProjectsModule } from '../projects/projects.module';

@Module({
  imports: [ProjectsModule],
  controllers: [
    IdeasProxyController,
    AttachmentsProxyController,
    CardsProxyController,
    NfrsProxyController,
    ExportsProxyController,
  ],
  providers: [ProxyService],
})
export class ProxyModule {}
