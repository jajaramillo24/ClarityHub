import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  /**
   * Transparent reverse proxy for a downstream REST service: rebuilds the
   * request against `targetBaseUrl` using the same path/method/body, and
   * pipes the response (status, content-type, body) straight back —
   * including binary/text bodies like jira-exporter-service's CSV download,
   * which is why this reads the response as a raw buffer instead of
   * assuming JSON both ways.
   *
   * Also forwards the active project's id (attached to `req.projectId` by
   * ProjectGuard, which checked it belongs to the JWT-verified caller) as
   * X-Project-Id — the only thing that lets idea-board/structure/jira-exporter
   * scope their data per project without each of them re-verifying
   * ownership themselves.
   */
  async forward(
    targetBaseUrl: string,
    req: Request,
    res: Response,
    timeoutMs = 10000,
  ): Promise<void> {
    const url = `${targetBaseUrl}${req.originalUrl}`;
    const hasBody = !['GET', 'HEAD', 'DELETE'].includes(req.method);
    const projectId = (req as Request & { projectId?: string }).projectId;

    const headers: Record<string, string> = {};
    if (hasBody) headers['content-type'] = 'application/json';
    if (projectId) headers['x-project-id'] = projectId;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        method: req.method,
        headers,
        body: hasBody ? JSON.stringify(req.body ?? {}) : undefined,
        signal: controller.signal,
      });

      const contentType =
        response.headers.get('content-type') ?? 'application/json';
      const contentDisposition = response.headers.get('content-disposition');
      const buffer = Buffer.from(await response.arrayBuffer());

      res.status(response.status);
      res.set('content-type', contentType);
      if (contentDisposition) {
        res.set('content-disposition', contentDisposition);
      }
      res.send(buffer);
    } catch (error) {
      this.logger.error(`Proxy request to ${url} failed`, error as Error);
      throw new ServiceUnavailableException(
        `Downstream service unavailable: ${(error as Error).message}`,
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
