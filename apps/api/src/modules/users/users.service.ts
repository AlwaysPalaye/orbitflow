import { Injectable, NotFoundException } from '@nestjs/common';

import { UsersRepository } from './users.repository';

/**
 * Users service - business logic for user operations.
 * Never touches the database directly; uses UsersRepository.
 *
 * All public methods strip sensitive fields (passwordHash) from responses.
 * Internal auth operations use UsersRepository directly (exported by UsersModule).
 */
@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async findById(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    // Never return sensitive fields
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _stripped, ...safeUser } = user;
    return safeUser;
  }
}
