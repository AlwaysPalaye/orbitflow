import { Logger } from '@nestjs/common';

import { AuditListener } from './audit.listener';
import type { AuditRepository } from './audit.repository';

import { createMock } from '@/test/test-harness';

describe('AuditListener', () => {
  const auditRepository = createMock<AuditRepository>(['create']);
  let listener: AuditListener;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    listener = new AuditListener(auditRepository as unknown as AuditRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('persists workspace-scoped board creation events', async () => {
    await listener.onBoardCreated({
      boardId: 'board-1',
      workspaceId: 'workspace-1',
      userId: 'user-1',
    });

    expect(auditRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        workspaceId: 'workspace-1',
        action: 'board.created',
        targetResource: 'board',
        targetId: 'board-1',
      }),
    );
  });

  it('persists post status changes with review metadata', async () => {
    await listener.onPostStatusChanged({
      postId: 'post-1',
      oldStatus: 'OPEN',
      newStatus: 'PLANNED',
      boardId: 'board-1',
      userId: 'admin-1',
    });

    expect(auditRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'admin-1',
        action: 'post.status_changed',
        targetResource: 'post',
        targetId: 'post-1',
        metadata: {
          oldStatus: 'OPEN',
          newStatus: 'PLANNED',
          boardId: 'board-1',
        },
      }),
    );
  });

  it('persists failed login events for known users', async () => {
    await listener.onLoginFailed({
      userId: 'user-1',
      email: 'will@example.com',
    });

    expect(auditRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        action: 'auth.login_failed',
        targetResource: 'user',
        targetId: 'user-1',
        metadata: { email: 'will@example.com' },
      }),
    );
  });

  it('does not break the original flow when audit persistence fails', async () => {
    auditRepository.create.mockRejectedValue(new Error('database unavailable'));

    await expect(listener.onUserLoggedIn({ userId: 'user-1' })).resolves.toBeUndefined();

    expect(Logger.prototype.error).toHaveBeenCalledWith(
      'Failed to write audit log for auth.logged_in: database unavailable',
    );
  });
});
