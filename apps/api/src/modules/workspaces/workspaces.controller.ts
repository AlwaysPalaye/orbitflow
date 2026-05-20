import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { WorkspacesService } from './workspaces.service';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';

/**
 * Workspaces controller - thin layer for multi-tenant workspace operations.
 */
@ApiTags('workspaces')
@ApiBearerAuth()
@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new workspace' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateWorkspaceDto) {
    return this.workspacesService.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List workspaces for current user' })
  async findUserWorkspaces(@CurrentUser('id') userId: string, @Query() query: PaginationQueryDto) {
    return this.workspacesService.findByUserId(userId, query.page, query.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workspace by ID' })
  async findById(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.workspacesService.findById(userId, id);
  }
}
