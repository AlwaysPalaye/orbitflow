import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PaginationQueryDto } from '@/common/dto/pagination.dto';

/**
 * Comments controller - thin layer for post comment operations.
 */
@ApiTags('comments')
@ApiBearerAuth()
@Controller()
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post('posts/:postId/comments')
  @ApiOperation({ summary: 'Add a comment to a post' })
  async create(
    @Param('postId') postId: string,
    @CurrentUser('id') userId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(postId, userId, dto);
  }

  @Get('posts/:postId/comments')
  @ApiOperation({ summary: 'List comments on a post' })
  async findByPost(
    @CurrentUser('id') userId: string,
    @Param('postId') postId: string,
    @Query() query: PaginationQueryDto,
  ) {
    return this.commentsService.findByPostId(userId, postId, query.page, query.limit);
  }

  @Delete('comments/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a comment' })
  async delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    await this.commentsService.delete(userId, id);
  }
}
