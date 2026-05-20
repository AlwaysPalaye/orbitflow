import { Module } from '@nestjs/common';

import { AuditListener } from './audit.listener';
import { AuditRepository } from './audit.repository';

/**
 * Audit module - captures domain events into persistent audit log entries.
 * Import this module in AppModule to activate event-driven audit logging.
 *
 * The AuditLog model stores: userId, workspaceId, action, targetResource,
 * targetId, metadata, ipAddress, and createdAt.
 */
@Module({
  providers: [AuditRepository, AuditListener],
  exports: [AuditRepository],
})
export class AuditModule {}
