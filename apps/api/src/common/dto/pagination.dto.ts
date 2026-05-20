import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

/**
 * Shared pagination query DTO for all list endpoints.
 * Defaults: page=1, limit=20, max limit=100.
 *
 * Usage: Add @Query() query: PaginationQueryDto to any list controller method.
 */
export class PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Page number (1-indexed)', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 20;
}

/**
 * Standardized pagination metadata included in list responses.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Paginated response shape returned by repositories.
 * The TransformInterceptor detects this shape and merges pagination
 * metadata into the response envelope's `meta` field.
 */
export interface PaginatedResult<T> {
  items: T[];
  meta: PaginationMeta;
}

/**
 * Helper to build a PaginatedResult from Prisma query results.
 */
export function paginate<T>(
  items: T[],
  totalItems: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    items,
    meta: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
}
