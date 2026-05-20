import { Injectable } from '@nestjs/common';

import { paginate } from '@/common/dto/pagination.dto';
import { PrismaService } from '@/prisma/prisma.service';

interface CreateBoardData {
  workspaceId: string;
  name: string;
  slug: string;
  description?: string;
  isPublic?: boolean;
  color?: string;
}

/**
 * Boards repository - sole database access layer for board operations.
 * All queries are workspace-scoped per multi-tenancy model.
 */
@Injectable()
export class BoardsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateBoardData) {
    return this.prisma.board.create({ data });
  }

  async findById(id: string) {
    return this.prisma.board.findUnique({
      where: { id },
      include: {
        _count: { select: { posts: true } },
      },
    });
  }

  async findByWorkspaceId(workspaceId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
      this.prisma.board.findMany({
        where: { workspaceId },
        include: {
          _count: { select: { posts: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.board.count({ where: { workspaceId } }),
    ]);

    return paginate(items, totalItems, page, limit);
  }

  async findBySlug(workspaceId: string, slug: string) {
    return this.prisma.board.findUnique({
      where: { workspaceId_slug: { workspaceId, slug } },
      include: {
        _count: { select: { posts: true } },
      },
    });
  }

  async findPublicBySlug(workspaceSlug: string, boardSlug: string) {
    return this.prisma.board.findFirst({
      where: {
        slug: boardSlug,
        isPublic: true,
        workspace: { slug: workspaceSlug },
      },
      include: {
        workspace: { select: { name: true, slug: true, logoUrl: true } },
        posts: {
          include: {
            author: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            comments: { select: { id: true } },
          },
          orderBy: { voteCount: 'desc' },
        },
        _count: { select: { posts: true } },
      },
    });
  }

  async update(id: string, data: Partial<CreateBoardData>) {
    return this.prisma.board.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.board.delete({ where: { id } });
  }
}
