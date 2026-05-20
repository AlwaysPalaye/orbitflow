import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

/**
 * Votes repository - sole database access layer for vote operations.
 * Enforces unique constraint: 1 vote per user per post.
 */
@Injectable()
export class VotesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByPostAndUser(postId: string, userId: string) {
    return this.prisma.vote.findUnique({
      where: { postId_userId: { postId, userId } },
    });
  }
}
