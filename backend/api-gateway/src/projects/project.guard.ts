import {
  CanActivate,
  ExecutionContext,
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { ProjectsService } from './projects.service';
import type { AuthenticatedUser } from '../auth/jwt-payload.interface';

/**
 * Applied to every domain proxy controller (ideas/attachments/cards/nfrs/
 * exports) — the frontend must say which project it's working in via
 * X-Project-Id, and that project has to actually belong to the JWT-verified
 * caller (ProjectsService.findOne 404s otherwise, same as any other id that
 * isn't yours). Runs after JwtAuthGuard, so `request.user` is already set.
 * ProxyService reads `request.projectId` to forward it downstream.
 */
@Injectable()
export class ProjectGuard implements CanActivate {
  constructor(private readonly projectsService: ProjectsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: AuthenticatedUser; projectId?: string }>();

    const projectId = request.headers['x-project-id'];
    if (!projectId || Array.isArray(projectId)) {
      throw new BadRequestException('Missing X-Project-Id header');
    }

    await this.projectsService.findOne(projectId, request.user.id);
    request.projectId = projectId;
    return true;
  }
}
