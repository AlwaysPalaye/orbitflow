import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/redis/redis.service';

/**
 * Health service - checks system component status.
 * Follows Controller -> Service pattern per ARCHITECTURE.md.
 */
@Injectable()
export class HealthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async check() {
    const [dbHealthy, redisHealthy] = await Promise.all([
      this.prisma.isHealthy(),
      this.redis.isHealthy(),
    ]);

    const status = dbHealthy && redisHealthy ? 'healthy' : 'degraded';

    return {
      status,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        database: dbHealthy ? 'up' : 'down',
        redis: redisHealthy ? 'up' : 'down',
      },
    };
  }
}
