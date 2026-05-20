import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { BoardsService } from './boards.service';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';

/**
 * Boards controller - thin layer for feedback board operations.
 * Public routes allow unauthenticated access to public boards.
 */
@ApiTags('boards')
@Controller()
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  // Authenticated routes (workspace-scoped)

  @Post('workspaces/:workspaceId/boards')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new feedback board' })
  async create(
    @CurrentUser('id') userId: string,
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateBoardDto,
  ) {
    return this.boardsService.create(userId, workspaceId, dto);
  }

  @Get('workspaces/:workspaceId/boards')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List all boards in a workspace' })
  async findByWorkspace(
    @CurrentUser('id') userId: string,
    @Param('workspaceId') workspaceId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.boardsService.findByWorkspaceId(userId, workspaceId, query.page, query.limit);
  }

  @Get('boards/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get board by ID' })
  async findById(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.boardsService.findById(userId, id);
  }

  @Patch('boards/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a board' })
  async update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBoardDto,
  ) {
    return this.boardsService.update(userId, id, dto);
  }

  @Delete('boards/:id')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a board' })
  async delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.boardsService.delete(userId, id);
  }

  // Public route (no auth required)

  @Get('public/:workspaceSlug/:boardSlug')
  @Public()
  @ApiOperation({ summary: 'Get public board by workspace and board slugs' })
  async findPublicBoard(
    @Param('workspaceSlug') workspaceSlug: string,
    @Param('boardSlug') boardSlug: string,
  ) {
    return this.boardsService.findPublicBoard(workspaceSlug, boardSlug);
  }
}
