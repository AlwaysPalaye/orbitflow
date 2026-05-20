import { Module } from '@nestjs/common';

import { WorkspacesController } from './workspaces.controller';
import { WorkspacesRepository } from './workspaces.repository';
import { WorkspacesService } from './workspaces.service';

@Module({
  controllers: [WorkspacesController],
  providers: [WorkspacesService, WorkspacesRepository],
  exports: [WorkspacesService, WorkspacesRepository],
})
export class WorkspacesModule {}
