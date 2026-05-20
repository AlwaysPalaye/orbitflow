import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AuthorizationModule } from './common/authorization/authorization.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { LoggerModule } from './common/logger/logger.module';
import { configuration, validationSchema } from './config/configuration';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { BoardsModule } from './modules/boards/boards.module';
import { CommentsModule } from './modules/comments/comments.module';
import { HealthModule } from './modules/health/health.module';
import { PostsModule } from './modules/posts/posts.module';
import { UsersModule } from './modules/users/users.module';
import { VotesModule } from './modules/votes/votes.module';
import { WorkspacesModule } from './modules/workspaces/workspaces.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: {
        abortEarly: true,
      },
    }),

    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),

    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: '.',
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),

    LoggerModule,
    AuthorizationModule,
    PrismaModule,
    RedisModule,

    HealthModule,
    AuthModule,
    UsersModule,
    WorkspacesModule,
    BoardsModule,
    PostsModule,
    VotesModule,
    CommentsModule,
    AuditModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // Workspace roles are tenant-scoped, not user-global. Feature services enforce
    // required roles with WorkspaceAccessService after the workspace/resource is known.
  ],
})
export class AppModule {}
