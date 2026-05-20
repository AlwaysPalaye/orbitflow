import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

import { HealthService } from './health.service';

import { Public } from '@/common/decorators/public.decorator';

/**
 * Health check controller - reports system component status.
 * Endpoint is public (no auth required).
 */
@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'System health check' })
  async check() {
    return this.healthService.check();
  }
}
