import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

/**
 * api-gateway is this service's only intended caller. It verifies the
 * caller's JWT and checks the requested project belongs to them
 * (ProjectGuard there) before ever proxying a request, then forwards the
 * project id as X-Project-Id (see ProxyService in api-gateway) — this
 * guard just trusts that header and uses it to scope every row to its
 * project. jira-exporter-service also calls in directly (fetching Ready
 * cards for an export), forwarding the same header it received from the
 * gateway.
 */
@Injectable()
export class ProjectGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { projectId?: string }>();
    const projectId = request.headers['x-project-id'];
    if (!projectId || Array.isArray(projectId)) {
      throw new UnauthorizedException('Missing X-Project-Id header');
    }
    request.projectId = projectId;
    return true;
  }
}
