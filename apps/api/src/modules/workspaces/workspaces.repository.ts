import { Injectable } from '@nestjs/common';

import { paginate } from '@/common/dto/pagination.dto';
import { PrismaService } from '@/prisma/prisma.service';

interface CreateWorkspaceWithOwner {
  name: string;
  slug: string;
  description?: string;
  ownerId: string;
}

/**
 * Workspaces repository - sole database access layer for workspace operations.
 * All queries are workspace-scoped per ARCHITECTURE.md multi-tenancy model.
 */
@Injectable()
export class WorkspacesRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates workspace and assigns creator as OWNER in a single transaction.
   */
  async createWithOwner(data: CreateWorkspaceWithOwner) {
    return this.prisma.$transaction(async (tx) => {
      const workspace = await tx.workspace.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
        },
      });

      await tx.workspaceMember.create({
        data: {
          userId: data.ownerId,
          workspaceId: workspace.id,
          role: 'OWNER',
        },
      });

      return workspace;
    });
  }

  async findById(id: string) {
    return this.prisma.workspace.findUnique({
      where: { id },
      include: {
        members: {
          include: { user: { select: { id: true, email: true, firstName: true, lastName: true } } },
        },
      },
    });
  }

  async findByUserId(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where = { members: { some: { userId } } };

    const [items, totalItems] = await Promise.all([
      this.prisma.workspace.findMany({
        where,
        include: {
          _count: { select: { members: true } },
        },
        skip,
        take: limit,
      }),
      this.prisma.workspace.count({ where }),
    ]);

    return paginate(items, totalItems, page, limit);
  }

  async findBySlug(slug: string) {
    return this.prisma.workspace.findUnique({ where: { slug } });
  }
}
