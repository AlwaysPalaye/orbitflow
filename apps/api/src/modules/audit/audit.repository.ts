import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

import { PrismaService } from '@/prisma/prisma.service';

interface CreateAuditLogData {
  userId: string;
  workspaceId?: string;
  action: string;
  targetResource?: string;
  targetId?: string;
  metadata?: Prisma.InputJsonValue;
  ipAddress?: string;
}

/**
 * Audit repository - sole database access layer for audit log entries.
 */
@Injectable()
export class AuditRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAuditLogData) {
    return this.prisma.auditLog.create({ data });
  }
}
