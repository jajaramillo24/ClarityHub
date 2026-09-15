import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ExportsModule } from './exports/exports.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, ExportsModule],
  controllers: [HealthController],
})
export class AppModule {}
