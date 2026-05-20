import { Module } from '@nestjs/common';

import { PostsModule } from '../posts/posts.module';

import { VotesController } from './votes.controller';
import { VotesRepository } from './votes.repository';
import { VotesService } from './votes.service';

@Module({
  imports: [PostsModule],
  controllers: [VotesController],
  providers: [VotesService, VotesRepository],
  exports: [VotesService],
})
export class VotesModule {}
