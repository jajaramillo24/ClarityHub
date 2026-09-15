import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { CardsModule } from './cards/cards.module';
import { NfrsModule } from './nfrs/nfrs.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, CardsModule, NfrsModule],
  controllers: [HealthController],
})
export class AppModule {}
