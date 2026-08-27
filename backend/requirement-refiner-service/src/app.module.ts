import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health/health.controller';
import { RefinerModule } from './refiner/refiner.module';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), RefinerModule],
  controllers: [HealthController],
})
export class AppModule {}
