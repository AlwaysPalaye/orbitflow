import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import type { Request } from 'express';

/**
 * Extracts the current authenticated user from the request.
 * Populated by JwtStrategy after token validation.
 *
 * Usage: @CurrentUser() user: JwtPayload
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = request.user;

    return data ? (user as Record<string, unknown>)?.[data] : user;
  },
);
