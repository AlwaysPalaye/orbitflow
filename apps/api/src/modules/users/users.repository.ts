import { Injectable } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';

interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName?: string;
  lastName?: string;
}

/**
 * Users repository - the only layer that touches the database for users.
 * Services call this, never Prisma directly.
 */
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateUserData) {
    return this.prisma.user.create({ data });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async updateLastLogin(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }
}
