import {
  BadRequestException,
  Controller,
  Logger,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { MessagePattern, Payload, RpcException } from '@nestjs/microservices';
import { ClaudeService } from '../claude/claude.service';
import {
  AnalyzeRisksDto,
  GenerateCardsDto,
  GenerateNfrsDto,
  GenerateSmartCardDto,
  SummarizeIdeasDto,
} from './dto/common.dto';

// Message patterns consumed over RabbitMQ by api-gateway. Keeping the AI
// provider behind a queue (rather than a direct HTTP call) is what lets the
// gateway apply a timeout and fail fast when this service — the one part of
// ClarityHub's backend that depends on an external, rate-limited provider —
// is down or overloaded, without taking the rest of the system down with it.
// ValidationPipe's default exceptionFactory throws BadRequestException,
// which the microservices layer doesn't know how to serialize — callers
// got an opaque "Internal server error" instead of the actual validation
// errors. Re-throwing as RpcException surfaces the real messages.
const rpcValidationPipe = new ValidationPipe({
  whitelist: true,
  transform: true,
  exceptionFactory: (errors) =>
    new RpcException(new BadRequestException(errors).getResponse()),
});

@Controller()
@UsePipes(rpcValidationPipe)
export class RefinerController {
  private readonly logger = new Logger(RefinerController.name);

  constructor(private readonly claude: ClaudeService) {}

  @MessagePattern('requirement_refiner.summarize_ideas')
  async summarizeIdeas(@Payload() dto: SummarizeIdeasDto) {
    return this.handle(() => this.claude.summarizeIdeas(dto.ideas, dto.attachments));
  }

  @MessagePattern('requirement_refiner.analyze_risks')
  async analyzeRisks(@Payload() dto: AnalyzeRisksDto) {
    return this.handle(() => this.claude.analyzeRisks(dto.nfrs));
  }

  @MessagePattern('requirement_refiner.generate_nfrs')
  async generateNfrs(@Payload() dto: GenerateNfrsDto) {
    return this.handle(() => this.claude.generateNfrsFromSummary(dto.summary, dto.ideas));
  }

  @MessagePattern('requirement_refiner.generate_cards')
  async generateCards(@Payload() dto: GenerateCardsDto) {
    return this.handle(() =>
      this.claude.generateCardsFromSummary(dto.summary, dto.ideas, dto.nfrs),
    );
  }

  @MessagePattern('requirement_refiner.generate_smart_card')
  async generateSmartCard(@Payload() dto: GenerateSmartCardDto) {
    return this.handle(() =>
      this.claude.generateSmartCard(dto.title, dto.ideas, dto.nfrs, dto.options),
    );
  }

  private async handle<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (error) {
      this.logger.error('Claude request failed', error as Error);
      throw new RpcException((error as Error).message ?? 'AI provider request failed');
    }
  }
}
