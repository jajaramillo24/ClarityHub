import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { corsOrigins } from './cors';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Railway (and most PaaS) put the app behind a reverse proxy — without
  // this, every request looks like it comes from the proxy's IP, which
  // breaks ThrottlerGuard's per-IP limiting.
  app.set('trust proxy', 1);
  app.enableCors({ origin: corsOrigins() });
  // Attachments arrive here as base64 in the JSON body (proxied through to
  // idea-board-service) — the default 100kb express limit is well under a
  // real document/image, so this is bumped to match the DTO's own cap
  // (see idea-board-service's CreateAttachmentDto) rather than rejecting
  // legitimate uploads at the parser before validation even runs.
  app.useBodyParser('json', { limit: '11mb' });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
}
bootstrap();
