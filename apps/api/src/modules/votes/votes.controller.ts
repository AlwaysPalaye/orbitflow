import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { VotesService } from './votes.service';

import { CurrentUser } from '@/common/decorators/current-user.decorator';

/**
 * Votes controller - toggle upvote on posts.
 */
@ApiTags('votes')
@ApiBearerAuth()
@Controller('posts/:postId/votes')
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  @ApiOperation({ summary: 'Toggle vote on a post (upvote/remove)' })
  async toggleVote(@Param('postId') postId: string, @CurrentUser('id') userId: string) {
    return this.votesService.toggleVote(postId, userId);
  }

  @Get('me')
  @ApiOperation({ summary: 'Check if current user has voted on a post' })
  async hasVoted(@Param('postId') postId: string, @CurrentUser('id') userId: string) {
    const voted = await this.votesService.hasVoted(postId, userId);
    return { voted };
  }
}
