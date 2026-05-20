import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { VotesRepository } from './votes.repository';

import { WorkspaceAccessService } from '@/common/authorization/workspace-access.service';
import { PrismaService } from '@/prisma/prisma.service';

/**
 * Votes service - toggle vote (upvote/remove) with denormalized count sync.
 * Uses Prisma transactions to prevent race conditions on concurrent votes.
 */
@Injectable()
export class VotesService {
  private readonly logger = new Logger(VotesService.name);

  constructor(
    private readonly votesRepository: VotesRepository,
    private readonly prisma: PrismaService,
    private readonly workspaceAccess: WorkspaceAccessService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Toggle vote: if user has not voted, add vote; otherwise remove vote.
   * Wrapped in a transaction to prevent race conditions that could
   * corrupt the denormalized voteCount.
   *
   * Returns { voted: boolean, voteCount: number }
   */
  async toggleVote(postId: string, userId: string) {
    await this.workspaceAccess.assertPostAccess(userId, postId);

    return this.prisma.$transaction(async (tx) => {
      const existingVote = await tx.vote.findUnique({
        where: { postId_userId: { postId, userId } },
      });

      if (existingVote) {
        await tx.vote.delete({
          where: { postId_userId: { postId, userId } },
        });
        const post = await tx.post.update({
          where: { id: postId },
          data: { voteCount: { decrement: 1 } },
        });

        this.logger.log(`Vote removed: user ${userId} on post ${postId}`);
        return { voted: false, voteCount: post.voteCount };
      }

      await tx.vote.create({
        data: { postId, userId },
      });
      const post = await tx.post.update({
        where: { id: postId },
        data: { voteCount: { increment: 1 } },
      });

      this.eventEmitter.emit('post.voted', { postId, userId });
      this.logger.log(`Vote added: user ${userId} on post ${postId}`);

      return { voted: true, voteCount: post.voteCount };
    });
  }

  /**
   * Check if user has voted on a specific post.
   */
  async hasVoted(postId: string, userId: string): Promise<boolean> {
    await this.workspaceAccess.assertPostAccess(userId, postId);

    const vote = await this.votesRepository.findByPostAndUser(postId, userId);
    return !!vote;
  }
}
