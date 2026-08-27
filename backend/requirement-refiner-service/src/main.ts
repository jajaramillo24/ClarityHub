import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  // Hybrid app: a small HTTP surface for health checks (docker healthcheck,
  // manual debugging) plus the RabbitMQ microservice transport that actually
  // serves requirement-refiner requests from api-gateway.
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const rabbitmqUrl = process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672';
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitmqUrl],
      queue: 'requirement_refiner_queue',
      queueOptions: { durable: true },
    },
  });

  await app.startAllMicroservices();

  const port = process.env.PORT ?? 3002;
  await app.listen(port);
}
bootstrap();
