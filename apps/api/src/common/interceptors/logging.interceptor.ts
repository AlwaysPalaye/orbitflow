import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import type { Request } from 'express';
import { Observable, tap, catchError, throwError } from 'rxjs';

/**
 * Logs every incoming request with method, URL, and response time.
 * Captures both successful responses and errors for complete visibility.
 * Follows structured logging pattern from ENGINEERING_RULES.md.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logger.log(`${method} ${url} - ${duration}ms`);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logger.error(`${method} ${url} - ${duration}ms - Error: ${error.message}`);
        return throwError(() => error);
      }),
    );
  }
}
