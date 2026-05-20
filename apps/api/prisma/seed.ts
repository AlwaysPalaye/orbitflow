import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Create a super admin user
  const seedPassword = process.env.SEED_ADMIN_PASSWORD || 'SenhaForte123!';
  console.log(
    'Using seed admin password from:',
    process.env.SEED_ADMIN_PASSWORD ? 'SEED_ADMIN_PASSWORD env var' : 'default (dev only)',
  );
  const hashedPassword = await bcrypt.hash(seedPassword, 12);
  const user = await prisma.user.upsert({
    where: { email: 'admin@willtech.com' },
    update: {},
    create: {
      email: 'admin@willtech.com',
      passwordHash: hashedPassword,
      firstName: 'Will',
      lastName: 'Tech',
    },
  });

  // 2. Create the main workspace
  const workspace = await prisma.workspace.upsert({
    where: { slug: 'orbitflow' },
    update: {},
    create: {
      name: 'OrbitFlow HQ',
      slug: 'orbitflow',
      description: 'Main workspace for OrbitFlow',
    },
  });

  // 3. Link user to workspace as OWNER
  await prisma.workspaceMember.upsert({
    where: {
      userId_workspaceId: {
        workspaceId: workspace.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      userId: user.id,
      role: 'OWNER',
    },
  });

  // 4. Create the public Feedback Board
  const board = await prisma.board.upsert({
    where: {
      workspaceId_slug: {
        workspaceId: workspace.id,
        slug: 'feedback',
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      name: 'Feature Requests',
      slug: 'feedback',
      description: 'Help us shape the future of OrbitFlow. Submit and vote on ideas.',
      isPublic: true,
      color: '#4f46e5',
    },
  });

  // 5. Create some realistic Posts (if they don't exist)
  const existingPosts = await prisma.post.count({ where: { boardId: board.id } });

  if (existingPosts === 0) {
    await prisma.post.createMany({
      data: [
        {
          boardId: board.id,
          authorId: user.id,
          title: 'Dark Mode Support in Dashboard',
          description:
            'It would be incredible to have a proper dark mode for the admin dashboard. Currently it hurts my eyes when reviewing data at night.',
          status: 'PLANNED',
          category: 'UI/UX',
          voteCount: 142,
        },
        {
          boardId: board.id,
          authorId: user.id,
          title: 'Export analytics to CSV/Excel',
          description:
            'We need a way to export our weekly feedback metrics to Excel so we can share it with our investors and stakeholders easily.',
          status: 'IN_PROGRESS',
          category: 'Analytics',
          voteCount: 89,
        },
        {
          boardId: board.id,
          authorId: user.id,
          title: 'Custom domain mapping',
          description:
            'Please allow us to map our own domain (e.g. feedback.mycompany.com) instead of using the default orbitflow domain.',
          status: 'OPEN',
          category: 'Infrastructure',
          voteCount: 56,
        },
      ],
    });
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
