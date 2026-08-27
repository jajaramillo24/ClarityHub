import { Body, Controller, Post } from '@nestjs/common';
import {
  AnalyzeRisksDto,
  GenerateCardsDto,
  GenerateNfrsDto,
  GenerateSmartCardDto,
  SummarizeIdeasDto,
} from './dto/common.dto';
import { RefinerClientService } from './refiner-client.service';

// Translates the frontend's synchronous AI requests into RabbitMQ RPC calls
// to requirement-refiner-service. This is the isolation boundary the brief
// asks for: RefinerClientService bounds every call with a timeout, so a
// stuck or dead refiner (or a dead RabbitMQ) turns into a clean 503/504
// here instead of hanging the gateway or, worse, the rest of the app.
@Controller('ai')
export class AiController {
  constructor(private readonly refiner: RefinerClientService) {}

  @Post('summarize')
  summarize(@Body() dto: SummarizeIdeasDto) {
    return this.refiner.send('requirement_refiner.summarize_ideas', dto);
  }

  @Post('risks')
  analyzeRisks(@Body() dto: AnalyzeRisksDto) {
    return this.refiner.send('requirement_refiner.analyze_risks', dto);
  }

  @Post('nfrs')
  generateNfrs(@Body() dto: GenerateNfrsDto) {
    return this.refiner.send('requirement_refiner.generate_nfrs', dto);
  }

  @Post('cards')
  generateCards(@Body() dto: GenerateCardsDto) {
    return this.refiner.send('requirement_refiner.generate_cards', dto);
  }

  @Post('smart-card')
  generateSmartCard(@Body() dto: GenerateSmartCardDto) {
    return this.refiner.send('requirement_refiner.generate_smart_card', dto);
  }
}
