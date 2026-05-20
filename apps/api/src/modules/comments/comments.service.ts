import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { CommentsRepository } from './comments.repository';
import { CreateCommentDto } from './dto/create-comment.dto';

import { WorkspaceAccessService } from '@/common/authorization/workspace-access.service';

/**
 * Comments service - business logic for post comments.
 * Official comments are highlighted as team responses.
 */
@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);

  constructor(
    private readonly commentsRepository: CommentsRepository,
    private readonly workspaceAccess: WorkspaceAccessService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(postId: string, authorId: string, dto: CreateCommentDto) {
    await this.workspaceAccess.assertPostAccess(
      authorId,
      postId,
      dto.isOfficial ? 'ADMIN' : 'VIEWER',
    );

    const comment = await this.commentsRepository.create({
      postId,
      authorId,
      content: dto.content,
      isOfficial: dto.isOfficial,
    });

    this.eventEmitter.emit('comment.created', {
      commentId: comment.id,
      postId,
      authorId,
      isOfficial: comment.isOfficial,
    });

    this.logger.log(`Comment created: ${comment.id} on post ${postId}`);

    return comment;
  }

  async findByPostId(userId: string, postId: string, page = 1, limit = 20) {
    await this.workspaceAccess.assertPostAccess(userId, postId);

    return this.commentsRepository.findByPostId(postId, page, limit);
  }

  async delete(userId: string, id: string) {
    const comment = await this.commentsRepository.findById(id);
    if (!comment) {
      throw new NotFoundException(`Comment ${id} not found`);
    }

    if (comment.authorId !== userId) {
      await this.workspaceAccess.assertCommentAccess(userId, id, 'ADMIN');
    }

    await this.commentsRepository.delete(id);
    this.logger.log(`Comment deleted: ${id}`);
  }
}
