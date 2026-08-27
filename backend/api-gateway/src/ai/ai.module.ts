import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AiController } from './ai.controller';
import { RefinerClientService } from './refiner-client.service';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: 'REFINER_CLIENT',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (config: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [config.get<string>('RABBITMQ_URL', 'amqp://guest:guest@localhost:5672')],
            queue: 'requirement_refiner_queue',
            queueOptions: { durable: true },
          },
        }),
      },
    ]),
  ],
  controllers: [AiController],
  providers: [RefinerClientService],
})
export class AiModule {}
