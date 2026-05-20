import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

export type WorkspaceRole = 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';

const ROLE_RANK: Record<WorkspaceRole, number> = {
  VIEWER: 10,
  MEMBER: 20,
  ADMIN: 30,
  OWNER: 40,
};

/**
 * Centralized tenant authorization.
 * Feature modules call this before reading or mutating workspace-owned data.
 */
@Injectable()
export class WorkspaceAccessService {
  constructor(private readonly prisma: PrismaService) {}

  async assertWorkspaceAccess(
    userId: string,
    workspaceId: string,
    minimumRole: WorkspaceRole = 'VIEWER',
  ) {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: { userId_workspaceId: { userId, workspaceId } },
    });

    if (!membership || ROLE_RANK[membership.role] < ROLE_RANK[minimumRole]) {
      throw new ForbiddenException('You do not have access to this workspace');
    }

    return membership;
  }

  async assertBoardAccess(userId: string, boardId: string, minimumRole: WorkspaceRole = 'VIEWER') {
    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
      select: { id: true, workspaceId: true },
    });

    if (!board) {
      throw new NotFoundException(`Board ${boardId} not found`);
    }

    await this.assertWorkspaceAccess(userId, board.workspaceId, minimumRole);
    return board;
  }

  async assertPostAccess(userId: string, postId: string, minimumRole: WorkspaceRole = 'VIEWER') {
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      select: {
        id: true,
        authorId: true,
        boardId: true,
        status: true,
        board: { select: { workspaceId: true } },
      },
    });

    if (!post) {
      throw new NotFoundException(`Post ${postId} not found`);
    }

    await this.assertWorkspaceAccess(userId, post.board.workspaceId, minimumRole);
    return post;
  }

  async assertCommentAccess(
    userId: string,
    commentId: string,
    minimumRole: WorkspaceRole = 'VIEWER',
  ) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
      select: {
        id: true,
        authorId: true,
        post: { select: { board: { select: { workspaceId: true } } } },
      },
    });

    if (!comment) {
      throw new NotFoundException(`Comment ${commentId} not found`);
    }

    await this.assertWorkspaceAccess(userId, comment.post.board.workspaceId, minimumRole);
    return comment;
  }
}
