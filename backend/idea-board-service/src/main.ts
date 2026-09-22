import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { corsOrigins } from './cors';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set('trust proxy', 1);
  app.enableCors({ origin: corsOrigins() });
  // Matches api-gateway's limit — attachments are usually proxied through
  // it, but this also has to accept the same size when hit directly (e.g.
  // local dev without the gateway). See CreateAttachmentDto for the actual
  // enforced cap.
  app.useBodyParser('json', { limit: '11mb' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = process.env.PORT ?? 3001;
  await app.listen(port);
}
bootstrap();
