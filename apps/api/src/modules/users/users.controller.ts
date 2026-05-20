import { Controller, ForbiddenException, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

import { UsersService } from './users.service';

import { CurrentUser } from '@/common/decorators/current-user.decorator';

/**
 * Users controller - thin layer, delegates to UsersService.
 */
@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@CurrentUser('id') userId: string) {
    return this.usersService.findById(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  async findById(@CurrentUser('id') currentUserId: string, @Param('id') id: string) {
    if (currentUserId !== id) {
      throw new ForbiddenException('You can only read your own profile');
    }

    return this.usersService.findById(id);
  }
}
