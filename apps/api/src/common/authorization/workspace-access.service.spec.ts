import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { WorkspaceAccessService } from './workspace-access.service';

import type { PrismaService } from '@/prisma/prisma.service';

describe('WorkspaceAccessService', () => {
  const workspaceMemberFindUnique = jest.fn();
  const boardFindUnique = jest.fn();
  const postFindUnique = jest.fn();
  const commentFindUnique = jest.fn();

  const prisma = {
    workspaceMember: { findUnique: workspaceMemberFindUnique },
    board: { findUnique: boardFindUnique },
    post: { findUnique: postFindUnique },
    comment: { findUnique: commentFindUnique },
  } as unknown as PrismaService;

  let service: WorkspaceAccessService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new WorkspaceAccessService(prisma);
  });

  it('allows a member with enough workspace role', async () => {
    workspaceMemberFindUnique.mockResolvedValue({
      userId: 'user-1',
      workspaceId: 'workspace-1',
      role: 'ADMIN',
    });

    await expect(
      service.assertWorkspaceAccess('user-1', 'workspace-1', 'MEMBER'),
    ).resolves.toMatchObject({
      role: 'ADMIN',
    });
  });

  it('rejects users without membership', async () => {
    workspaceMemberFindUnique.mockResolvedValue(null);

    await expect(service.assertWorkspaceAccess('user-1', 'workspace-1')).rejects.toBeInstanceOf(
      ForbiddenException,
    );
  });

  it('rejects members below the required role', async () => {
    workspaceMemberFindUnique.mockResolvedValue({
      userId: 'user-1',
      workspaceId: 'workspace-1',
      role: 'VIEWER',
    });

    await expect(
      service.assertWorkspaceAccess('user-1', 'workspace-1', 'ADMIN'),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('checks board access through its workspace', async () => {
    boardFindUnique.mockResolvedValue({ id: 'board-1', workspaceId: 'workspace-1' });
    workspaceMemberFindUnique.mockResolvedValue({
      userId: 'user-1',
      workspaceId: 'workspace-1',
      role: 'OWNER',
    });

    await expect(service.assertBoardAccess('user-1', 'board-1', 'ADMIN')).resolves.toMatchObject({
      workspaceId: 'workspace-1',
    });
  });

  it('throws not found when the scoped resource does not exist', async () => {
    boardFindUnique.mockResolvedValue(null);

    await expect(service.assertBoardAccess('user-1', 'missing-board')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
