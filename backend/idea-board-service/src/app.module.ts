import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { IdeasModule } from './ideas/ideas.module';
import { AttachmentsModule } from './attachments/attachments.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    IdeasModule,
    AttachmentsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
