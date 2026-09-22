import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/** The project id ProjectGuard attached to the request — only usable on routes guarded by it. */
export const CurrentProject = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { projectId: string }>();
    return request.projectId;
  },
);
