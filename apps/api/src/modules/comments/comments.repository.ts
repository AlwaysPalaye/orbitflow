import { Injectable } from '@nestjs/common';

import { paginate } from '@/common/dto/pagination.dto';
import { PrismaService } from '@/prisma/prisma.service';

interface CreateCommentData {
  postId: string;
  authorId: string;
  content: string;
  isOfficial?: boolean;
}

/**
 * Comments repository - sole database access layer for comment operations.
 */
@Injectable()
export class CommentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCommentData) {
    return this.prisma.comment.create({
      data,
      include: {
        author: {
          select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });
  }

  async findByPostId(postId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [items, totalItems] = await Promise.all([
      this.prisma.comment.findMany({
        where: { postId },
        include: {
          author: {
            select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.comment.count({ where: { postId } }),
    ]);

    return paginate(items, totalItems, page, limit);
  }

  async findById(id: string) {
    return this.prisma.comment.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, email: true, firstName: true, lastName: true, avatarUrl: true },
        },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.comment.delete({ where: { id } });
  }
}
