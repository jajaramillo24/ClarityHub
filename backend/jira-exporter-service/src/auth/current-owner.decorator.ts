import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/** The owner id OwnerGuard attached to the request — only usable on routes guarded by it. */
export const CurrentOwner = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { ownerId: string }>();
    return request.ownerId;
  },
);
