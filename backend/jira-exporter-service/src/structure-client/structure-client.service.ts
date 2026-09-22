import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ProjectCard } from '../types';

@Injectable()
export class StructureClientService {
  private readonly logger = new Logger(StructureClientService.name);
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>(
      'STRUCTURE_SERVICE_URL',
      'http://localhost:3003',
    );
    this.timeoutMs = this.config.get<number>(
      'STRUCTURE_SERVICE_TIMEOUT_MS',
      5000,
    );
  }

  /**
   * Fetches Ready cards from structure-service. Fails fast with a clean,
   * typed error (rather than hanging or crashing) when structure-service is
   * unreachable — the caller decides what to do (e.g. mark an export job as
   * failed, so it can be retried once structure-service is back, without
   * losing anything: the backlog itself lives in structure-service's own
   * database, untouched by an export failure here).
   */
  async fetchReadyCards(projectId: string): Promise<ProjectCard[]> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/cards?status=Ready`, {
        headers: { 'x-project-id': projectId },
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`structure-service responded with ${response.status}`);
      }

      return (await response.json()) as ProjectCard[];
    } catch (error) {
      this.logger.error(
        'Failed to fetch cards from structure-service',
        error as Error,
      );
      throw new ServiceUnavailableException(
        `Could not reach structure-service: ${(error as Error).message}`,
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
