import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

/**
 * api-gateway is this service's only intended caller and always forwards
 * the requesting user's id as X-User-Id (see ProxyService in api-gateway,
 * which reads it off the JWT JwtAuthGuard already verified) — this guard
 * just trusts that header and uses it to scope every row to its owner.
 * jira-exporter-service also calls in directly (fetching Ready cards for an
 * export), forwarding the same header it received from the gateway.
 */
@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { ownerId?: string }>();
    const ownerId = request.headers['x-user-id'];
    if (!ownerId || Array.isArray(ownerId)) {
      throw new UnauthorizedException('Missing X-User-Id header');
    }
    request.ownerId = ownerId;
    return true;
  }
}
