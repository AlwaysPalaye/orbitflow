import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { BoardsRepository } from './boards.repository';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

import { WorkspaceAccessService } from '@/common/authorization/workspace-access.service';
import { generateSlug } from '@/common/utils/slug.util';

/**
 * Boards service - business logic for feedback boards.
 * All operations are workspace-scoped.
 */
@Injectable()
export class BoardsService {
  private readonly logger = new Logger(BoardsService.name);

  constructor(
    private readonly boardsRepository: BoardsRepository,
    private readonly workspaceAccess: WorkspaceAccessService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, workspaceId: string, dto: CreateBoardDto) {
    await this.workspaceAccess.assertWorkspaceAccess(userId, workspaceId, 'ADMIN');

    const slug = generateSlug(dto.name);

    // Check for duplicate slug within workspace
    const existing = await this.boardsRepository.findBySlug(workspaceId, slug);
    if (existing) {
      throw new ConflictException(`Board with slug "${slug}" already exists in this workspace`);
    }

    const board = await this.boardsRepository.create({
      workspaceId,
      name: dto.name,
      slug,
      description: dto.description,
      isPublic: dto.isPublic,
      color: dto.color,
    });

    this.eventEmitter.emit('board.created', { boardId: board.id, workspaceId, userId });
    this.logger.log(`Board created: ${board.id} in workspace ${workspaceId}`);

    return board;
  }

  async findByWorkspaceId(userId: string, workspaceId: string, page = 1, limit = 20) {
    await this.workspaceAccess.assertWorkspaceAccess(userId, workspaceId);

    return this.boardsRepository.findByWorkspaceId(workspaceId, page, limit);
  }

  async findById(userId: string, id: string) {
    await this.workspaceAccess.assertBoardAccess(userId, id);

    const board = await this.boardsRepository.findById(id);
    if (!board) {
      throw new NotFoundException(`Board ${id} not found`);
    }
    return board;
  }

  async findPublicBoard(workspaceSlug: string, boardSlug: string) {
    const board = await this.boardsRepository.findPublicBySlug(workspaceSlug, boardSlug);
    if (!board) {
      throw new NotFoundException('Board not found or is not public');
    }
    return board;
  }

  async update(userId: string, id: string, dto: UpdateBoardDto) {
    await this.workspaceAccess.assertBoardAccess(userId, id, 'ADMIN');

    const data: Record<string, unknown> = { ...dto };
    if (dto.name) {
      data.slug = generateSlug(dto.name);
    }

    return this.boardsRepository.update(id, data);
  }

  async delete(userId: string, id: string) {
    const board = await this.workspaceAccess.assertBoardAccess(userId, id, 'ADMIN');

    await this.boardsRepository.delete(id);
    this.eventEmitter.emit('board.deleted', {
      boardId: id,
      workspaceId: board.workspaceId,
      userId,
    });
    this.logger.log(`Board deleted: ${id}`);
  }
}
