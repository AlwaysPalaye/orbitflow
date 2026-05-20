import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import type { Prisma } from '@prisma/client';

import { AuditRepository } from './audit.repository';

/**
 * Audit event listener - captures domain events and persists audit log entries.
 * Follows event-driven architecture from ARCHITECTURE.md.
 *
 * Each handler is non-blocking; failures are logged but do not affect the
 * original operation that emitted the event.
 */
@Injectable()
export class AuditListener {
  private readonly logger = new Logger(AuditListener.name);

  constructor(private readonly auditRepository: AuditRepository) {}

  @OnEvent('auth.registered')
  async onUserRegistered(payload: { userId: string; email: string }) {
    await this.safeLog({
      userId: payload.userId,
      action: 'auth.registered',
      targetResource: 'user',
      targetId: payload.userId,
      metadata: { email: payload.email },
    });
  }

  @OnEvent('auth.logged_in')
  async onUserLoggedIn(payload: { userId: string }) {
    await this.safeLog({
      userId: payload.userId,
      action: 'auth.logged_in',
      targetResource: 'user',
      targetId: payload.userId,
    });
  }

  @OnEvent('auth.login_failed')
  async onLoginFailed(payload: { userId?: string; email: string }) {
    await this.safeLog({
      userId: payload.userId,
      action: 'auth.login_failed',
      targetResource: 'user',
      targetId: payload.userId,
      metadata: { email: payload.email },
    });
  }

  @OnEvent('workspace.created')
  async onWorkspaceCreated(payload: { workspaceId: string; userId: string }) {
    await this.safeLog({
      userId: payload.userId,
      action: 'workspace.created',
      workspaceId: payload.workspaceId,
      targetResource: 'workspace',
      targetId: payload.workspaceId,
    });
  }

  @OnEvent('board.created')
  async onBoardCreated(payload: { boardId: string; workspaceId: string; userId: string }) {
    await this.safeLog({
      userId: payload.userId,
      action: 'board.created',
      workspaceId: payload.workspaceId,
      targetResource: 'board',
      targetId: payload.boardId,
    });
  }

  @OnEvent('board.deleted')
  async onBoardDeleted(payload: { boardId: string; workspaceId: string; userId: string }) {
    await this.safeLog({
      userId: payload.userId,
      action: 'board.deleted',
      workspaceId: payload.workspaceId,
      targetResource: 'board',
      targetId: payload.boardId,
    });
  }

  @OnEvent('post.created')
  async onPostCreated(payload: { postId: string; boardId: string; authorId: string }) {
    await this.safeLog({
      userId: payload.authorId,
      action: 'post.created',
      targetResource: 'post',
      targetId: payload.postId,
      metadata: { boardId: payload.boardId },
    });
  }

  @OnEvent('post.status_changed')
  async onPostStatusChanged(payload: {
    postId: string;
    oldStatus: string;
    newStatus: string;
    boardId: string;
    userId: string;
  }) {
    await this.safeLog({
      userId: payload.userId,
      action: 'post.status_changed',
      targetResource: 'post',
      targetId: payload.postId,
      metadata: {
        oldStatus: payload.oldStatus,
        newStatus: payload.newStatus,
        boardId: payload.boardId,
      },
    });
  }

  @OnEvent('post.voted')
  async onPostVoted(payload: { postId: string; userId: string }) {
    await this.safeLog({
      userId: payload.userId,
      action: 'post.voted',
      targetResource: 'post',
      targetId: payload.postId,
    });
  }

  @OnEvent('comment.created')
  async onCommentCreated(payload: {
    commentId: string;
    postId: string;
    authorId: string;
    isOfficial: boolean;
  }) {
    await this.safeLog({
      userId: payload.authorId,
      action: 'comment.created',
      targetResource: 'comment',
      targetId: payload.commentId,
      metadata: { postId: payload.postId, isOfficial: payload.isOfficial },
    });
  }

  /**
   * Safe wrapper that catches and logs audit failures without interrupting
   * the original operation. Audit logging must never break user-facing flows.
   */
  private async safeLog(data: {
    userId?: string;
    workspaceId?: string;
    action: string;
    targetResource?: string;
    targetId?: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    try {
      // userId is required by the AuditLog model; skip if not available.
      if (!data.userId) {
        this.logger.debug(`Skipping audit log for ${data.action}: no userId available`);
        return;
      }
      await this.auditRepository.create({
        userId: data.userId,
        workspaceId: data.workspaceId,
        action: data.action,
        targetResource: data.targetResource,
        targetId: data.targetId,
        metadata: data.metadata,
      });
    } catch (error) {
      this.logger.error(
        `Failed to write audit log for ${data.action}: ${(error as Error).message}`,
      );
    }
  }
}
