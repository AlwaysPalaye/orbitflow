import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, map } from 'rxjs';

import type { PaginationMeta } from '../dto/pagination.dto';

/**
 * Wraps all successful responses in a consistent envelope.
 *
 * Standard output: { data: <response>, meta: { timestamp } }
 * Paginated output: { data: <items>, meta: { timestamp, page, limit, totalItems, totalPages } }
 *
 * Paginated responses are detected automatically when the service returns
 * an object with `items` and `meta` properties (PaginatedResult shape).
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  { data: unknown; meta: object }
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<{ data: unknown; meta: object }> {
    return next.handle().pipe(
      map((responseData) => {
        // Detect paginated response shape (PaginatedResult<T>)
        if (
          responseData &&
          typeof responseData === 'object' &&
          'items' in responseData &&
          'meta' in responseData
        ) {
          const paginated = responseData as unknown as {
            items: unknown[];
            meta: PaginationMeta;
          };

          return {
            data: paginated.items,
            meta: {
              ...paginated.meta,
              timestamp: new Date().toISOString(),
            },
          };
        }

        return {
          data: responseData,
          meta: {
            timestamp: new Date().toISOString(),
          },
        };
      }),
    );
  }
}
