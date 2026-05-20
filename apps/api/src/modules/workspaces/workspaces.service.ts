import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { WorkspacesRepository } from './workspaces.repository';

import { WorkspaceAccessService } from '@/common/authorization/workspace-access.service';
import { generateSlug } from '@/common/utils/slug.util';

/**
 * Workspaces service - business logic for workspace and membership operations.
 * Creates workspace with the creator as OWNER automatically.
 */
@Injectable()
export class WorkspacesService {
  private readonly logger = new Logger(WorkspacesService.name);

  constructor(
    private readonly workspacesRepository: WorkspacesRepository,
    private readonly workspaceAccess: WorkspaceAccessService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, dto: CreateWorkspaceDto) {
    const slug = generateSlug(dto.name);
    const existingWorkspace = await this.workspacesRepository.findBySlug(slug);

    if (existingWorkspace) {
      throw new ConflictException(`Workspace with slug "${slug}" already exists`);
    }

    const workspace = await this.workspacesRepository.createWithOwner({
      name: dto.name,
      slug,
      description: dto.description,
      ownerId: userId,
    });

    this.eventEmitter.emit('workspace.created', {
      workspaceId: workspace.id,
      userId,
    });

    this.logger.log(`Workspace created: ${workspace.id} by user ${userId}`);

    return workspace;
  }

  async findById(userId: string, id: string) {
    await this.workspaceAccess.assertWorkspaceAccess(userId, id);

    const workspace = await this.workspacesRepository.findById(id);
    if (!workspace) {
      throw new NotFoundException(`Workspace ${id} not found`);
    }
    return workspace;
  }

  async findByUserId(userId: string, page = 1, limit = 20) {
    return this.workspacesRepository.findByUserId(userId, page, limit);
  }
}
