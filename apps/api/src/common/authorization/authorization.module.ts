import { Global, Module } from '@nestjs/common';

import { WorkspaceAccessService } from './workspace-access.service';

@Global()
@Module({
  providers: [WorkspaceAccessService],
  exports: [WorkspaceAccessService],
})
export class AuthorizationModule {}
