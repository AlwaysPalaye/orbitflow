import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostStatusDto } from './dto/update-post-status.dto';
import { PostsRepository } from './posts.repository';

import { WorkspaceAccessService } from '@/common/authorization/workspace-access.service';

/**
 * Posts service - business logic for feedback posts.
 * Emits events when status changes for notification purposes.
 */
@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly workspaceAccess: WorkspaceAccessService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(boardId: string, authorId: string, dto: CreatePostDto) {
    await this.workspaceAccess.assertBoardAccess(authorId, boardId);

    const post = await this.postsRepository.create({
      boardId,
      authorId,
      title: dto.title,
      description: dto.description,
      category: dto.category,
    });

    this.eventEmitter.emit('post.created', { postId: post.id, boardId, authorId });
    this.logger.log(`Post created: ${post.id} on board ${boardId}`);

    return post;
  }

  async findByBoardId(
    userId: string,
    boardId: string,
    sortBy: 'votes' | 'recent' = 'votes',
    page = 1,
    limit = 20,
  ) {
    await this.workspaceAccess.assertBoardAccess(userId, boardId);

    return this.postsRepository.findByBoardId(boardId, sortBy, page, limit);
  }

  async findById(userId: string, id: string) {
    await this.workspaceAccess.assertPostAccess(userId, id);

    const post = await this.postsRepository.findById(id);
    if (!post) {
      throw new NotFoundException(`Post ${id} not found`);
    }
    return post;
  }

  async updateStatus(userId: string, id: string, dto: UpdatePostStatusDto) {
    const post = await this.workspaceAccess.assertPostAccess(userId, id, 'ADMIN');
    const oldStatus = post.status;

    const updated = await this.postsRepository.updateStatus(id, dto.status);

    this.eventEmitter.emit('post.status_changed', {
      postId: id,
      oldStatus,
      newStatus: dto.status,
      boardId: post.boardId,
      userId,
    });

    this.logger.log(`Post ${id} status: ${oldStatus} -> ${dto.status}`);

    return updated;
  }

  async delete(userId: string, id: string) {
    await this.workspaceAccess.assertPostAccess(userId, id, 'ADMIN');

    await this.postsRepository.delete(id);
    this.logger.log(`Post deleted: ${id}`);
  }
}
