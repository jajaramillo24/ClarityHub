import {
  GatewayTimeoutException,
  Inject,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, TimeoutError } from 'rxjs';
import { timeout } from 'rxjs/operators';

// Opus-class, non-streaming report generation (summarize/nfrs/cards) routinely
// takes 30-60s on its own before RabbitMQ round-trip overhead is even added —
// 45s was cutting it too close and caused spurious "did not respond in time"
// errors on real (not just slow) responses. 120s gives real headroom.
const REFINER_TIMEOUT_MS = 120000;

@Injectable()
export class RefinerClientService {
  private readonly logger = new Logger(RefinerClientService.name);

  constructor(@Inject('REFINER_CLIENT') private readonly client: ClientProxy) {}

  async send<T>(pattern: string, payload: unknown): Promise<T> {
    try {
      return await firstValueFrom(
        this.client.send<T>(pattern, payload).pipe(timeout(REFINER_TIMEOUT_MS)),
      );
    } catch (error) {
      this.logger.error(`Refiner call '${pattern}' failed`, error as Error);

      if (error instanceof TimeoutError) {
        throw new GatewayTimeoutException(
          'requirement-refiner-service did not respond in time',
        );
      }

      // RpcException payloads and raw connection errors both land here as
      // plain objects/Errors, not typed exceptions — normalize to a clean
      // 503 rather than leaking broker/internal error shapes to the client.
      const message =
        typeof error === 'object' && error !== null && 'message' in error
          ? String((error as { message: unknown }).message)
          : 'requirement-refiner-service is unavailable';

      throw new ServiceUnavailableException(message);
    }
  }
}
