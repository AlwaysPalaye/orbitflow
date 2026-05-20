import { Injectable } from '@nestjs/common';
import { PostStatus } from '@prisma/client';

import { paginate } from '@/common/dto/pagination.dto';
import { PrismaService } from '@/prisma/prisma.service';

interface CreatePostData {
  boardId: string;
  authorId: string;
  title: string;
  description: string;
  category?: string;
}

/**
 * Posts repository - sole database access layer for post operations.
 */
@Injectable()
export class PostsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreatePostData) {
    return this.prisma.post.create({
      data,
      include: {
        author: {
          select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true },
        },
        _count: { select: { votes: true, comments: true } },
      },
    });
  }

  async findById(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true },
        },
        _count: { select: { votes: true, comments: true } },
      },
    });
  }

  async findByBoardId(boardId: string, sortBy: 'votes' | 'recent' = 'votes', page = 1, limit = 20) {
    const orderBy =
      sortBy === 'votes' ? { voteCount: 'desc' as const } : { createdAt: 'desc' as const };
    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
      this.prisma.post.findMany({
        where: { boardId },
        include: {
          author: {
            select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true },
          },
          _count: { select: { votes: true, comments: true } },
        },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where: { boardId } }),
    ]);

    return paginate(items, totalItems, page, limit);
  }

  async updateStatus(id: string, status: PostStatus) {
    return this.prisma.post.update({
      where: { id },
      data: { status },
      include: {
        author: {
          select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true },
        },
        _count: { select: { votes: true, comments: true } },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.post.delete({ where: { id } });
  }
}
