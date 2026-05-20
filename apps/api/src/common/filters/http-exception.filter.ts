import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import type { Response, Request } from 'express';

/**
 * Global HTTP exception filter.
 * Returns consistent error envelope: { error: { code, message, statusCode } }
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = exception instanceof HttpException ? exception.getResponse() : null;

    const message =
      typeof errorResponse === 'string'
        ? errorResponse
        : (errorResponse as Record<string, unknown>)?.message || 'Internal server error';

    const code = this.getErrorCode(statusCode);

    response.status(statusCode).json({
      error: {
        code,
        statusCode,
        message,
        path: request.url,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private getErrorCode(statusCode: number): string {
    const codeMap: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
    };

    return codeMap[statusCode] || 'UNKNOWN_ERROR';
  }
}
