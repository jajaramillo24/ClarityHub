import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Public } from '../auth/decorators/public.decorator';

interface ServiceHealth {
  name: string;
  url: string;
  status: 'up' | 'down';
  error?: string;
}

@Public()
@Controller('health')
export class HealthController {
  constructor(private readonly config: ConfigService) {}

  @Get()
  check() {
    return { status: 'ok', service: 'api-gateway' };
  }

  /**
   * Pings every downstream HTTP service and reports up/down individually —
   * built for exactly the demo the brief asks for (stop one container,
   * show the rest keep responding). requirement-refiner-service isn't
   * polled here since it has no HTTP surface beyond its own /health; its
   * reachability is instead proven live by whether /ai/* calls succeed.
   */
  @Get('services')
  async checkServices() {
    const targets: Array<{ name: string; url: string }> = [
      {
        name: 'idea-board-service',
        url: this.config.get<string>(
          'IDEA_BOARD_SERVICE_URL',
          'http://localhost:3001',
        ),
      },
      {
        name: 'structure-service',
        url: this.config.get<string>(
          'STRUCTURE_SERVICE_URL',
          'http://localhost:3003',
        ),
      },
      {
        name: 'jira-exporter-service',
        url: this.config.get<string>(
          'JIRA_EXPORTER_SERVICE_URL',
          'http://localhost:3004',
        ),
      },
      {
        name: 'requirement-refiner-service',
        url: this.config.get<string>(
          'REQUIREMENT_REFINER_SERVICE_URL',
          'http://localhost:3002',
        ),
      },
    ];

    const results: ServiceHealth[] = await Promise.all(
      targets.map(async (target) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        try {
          const response = await fetch(`${target.url}/health`, {
            signal: controller.signal,
          });
          return {
            name: target.name,
            url: target.url,
            status: response.ok ? ('up' as const) : ('down' as const),
          };
        } catch (error) {
          return {
            name: target.name,
            url: target.url,
            status: 'down' as const,
            error: (error as Error).message,
          };
        } finally {
          clearTimeout(timeout);
        }
      }),
    );

    return { gateway: 'up', services: results };
  }
}
