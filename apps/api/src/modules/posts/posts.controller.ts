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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostStatusDto } from './dto/update-post-status.dto';
import { PostsService } from './posts.service';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';

/**
 * Posts controller - thin layer for feedback post operations.
 */
@ApiTags('posts')
@ApiBearerAuth()
@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post('boards/:boardId/posts')
  @ApiOperation({ summary: 'Create a new post on a board' })
  async create(
    @Param('boardId') boardId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreatePostDto,
  ) {
    return this.postsService.create(boardId, userId, dto);
  }

  @Get('boards/:boardId/posts')
  @ApiOperation({ summary: 'List posts on a board' })
  @ApiQuery({ name: 'sort', enum: ['votes', 'recent'], required: false })
  async findByBoard(
    @CurrentUser('id') userId: string,
    @Param('boardId') boardId: string,
    @Query('sort') sort: 'votes' | 'recent' = 'votes',
    @Query() query: PaginationQueryDto,
  ) {
    return this.postsService.findByBoardId(userId, boardId, sort, query.page, query.limit);
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Get post by ID' })
  async findById(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.postsService.findById(userId, id);
  }

  @Patch('posts/:id/status')
  @ApiOperation({ summary: 'Update post status (admin only)' })
  async updateStatus(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdatePostStatusDto,
  ) {
    return this.postsService.updateStatus(userId, id, dto);
  }

  @Delete('posts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a post' })
  async delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.postsService.delete(userId, id);
  }
}
