import { Body, Controller, Post, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import {
  AnalyzeRisksDto,
  GenerateCardsDto,
  GenerateNfrsDto,
  GenerateSmartCardDto,
  SummarizeIdeasDto,
} from './dto/common.dto';
import { RefinerClientService } from './refiner-client.service';

const HEARTBEAT_INTERVAL_MS = 15000;

// Translates the frontend's synchronous AI requests into RabbitMQ RPC calls
// to requirement-refiner-service. This is the isolation boundary the brief
// asks for: RefinerClientService bounds every call with a timeout, so a
// stuck or dead refiner (or a dead RabbitMQ) turns into a clean 503/504
// here instead of hanging the gateway or, worse, the rest of the app.
//
// Throttled much tighter than the app-wide default: every route here spends
// real Anthropic quota, so this is the one place a flood costs money, not
// just load.
@Throttle({ default: { limit: 20, ttl: 60000 } })
@Controller('ai')
export class AiController {
  constructor(private readonly refiner: RefinerClientService) {}

  @Post('summarize')
  summarize(@Body() dto: SummarizeIdeasDto, @Res() res: Response) {
    return this.respond(res, () =>
      this.refiner.send('requirement_refiner.summarize_ideas', dto),
    );
  }

  @Post('risks')
  analyzeRisks(@Body() dto: AnalyzeRisksDto, @Res() res: Response) {
    return this.respond(res, () =>
      this.refiner.send('requirement_refiner.analyze_risks', dto),
    );
  }

  @Post('nfrs')
  generateNfrs(@Body() dto: GenerateNfrsDto, @Res() res: Response) {
    return this.respond(res, () =>
      this.refiner.send('requirement_refiner.generate_nfrs', dto),
    );
  }

  @Post('cards')
  generateCards(@Body() dto: GenerateCardsDto, @Res() res: Response) {
    return this.respond(res, () =>
      this.refiner.send('requirement_refiner.generate_cards', dto),
    );
  }

  @Post('smart-card')
  generateSmartCard(@Body() dto: GenerateSmartCardDto, @Res() res: Response) {
    return this.respond(res, () =>
      this.refiner.send('requirement_refiner.generate_smart_card', dto),
    );
  }

  // Claude calls routinely run past a minute. Some networks between the
  // browser and this gateway (corporate proxies, security software, NAT/VPN
  // idle timers) silently drop a connection that goes that long without any
  // bytes flowing, and they do it below the application layer — neither side
  // sees an error, the socket just dies. Writing a heartbeat byte at a
  // steady cadence keeps traffic visibly flowing so nothing in the path
  // decides the connection is dead.
  //
  // The tradeoff: once the first byte is written, the response's status
  // line is locked in at 200 — we can no longer switch to a 503/504 if the
  // call fails afterwards. So the real outcome travels in a JSON envelope
  // in the body instead of the status code; callers must check `ok`.
  private async respond(
    res: Response,
    fn: () => Promise<unknown>,
  ): Promise<void> {
    res.setHeader('Content-Type', 'application/json');
    const heartbeat = setInterval(() => res.write(' '), HEARTBEAT_INTERVAL_MS);
    try {
      const data = await fn();
      clearInterval(heartbeat);
      res.end(JSON.stringify({ ok: true, data }));
    } catch (error) {
      clearInterval(heartbeat);
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message: unknown }).message)
          : 'AI provider request failed';
      res.end(JSON.stringify({ ok: false, message }));
    }
  }
}
