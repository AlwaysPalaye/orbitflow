import { Logger } from '@nestjs/common';
import type { EventEmitter2 } from '@nestjs/event-emitter';

import type { VotesRepository } from './votes.repository';
import { VotesService } from './votes.service';

import type { WorkspaceAccessService } from '@/common/authorization/workspace-access.service';
import type { PrismaService } from '@/prisma/prisma.service';
import { createMock, createTransactionMock } from '@/test/test-harness';

describe('VotesService', () => {
  const votesRepository = createMock<VotesRepository>(['findByPostAndUser']);
  const workspaceAccess = createMock<WorkspaceAccessService>(['assertPostAccess']);
  const eventEmitter = createMock<EventEmitter2>(['emit']);

  const tx = {
    vote: {
      findUnique: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    },
    post: {
      update: jest.fn(),
    },
  };

  const prisma = {
    $transaction: createTransactionMock(tx),
  } as unknown as PrismaService;

  let service: VotesService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    workspaceAccess.assertPostAccess.mockResolvedValue({
      id: 'post-1',
      boardId: 'board-1',
      authorId: 'user-1',
      status: 'OPEN',
      board: { workspaceId: 'workspace-1' },
    });

    service = new VotesService(
      votesRepository as unknown as VotesRepository,
      prisma,
      workspaceAccess as unknown as WorkspaceAccessService,
      eventEmitter as unknown as EventEmitter2,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('adds a vote inside a transaction and increments the denormalized count', async () => {
    tx.vote.findUnique.mockResolvedValue(null);
    tx.post.update.mockResolvedValue({ id: 'post-1', voteCount: 11 });

    await expect(service.toggleVote('post-1', 'user-1')).resolves.toEqual({
      voted: true,
      voteCount: 11,
    });

    expect(workspaceAccess.assertPostAccess).toHaveBeenCalledWith('user-1', 'post-1');
    expect(prisma.$transaction).toHaveBeenCalledTimes(1);
    expect(tx.vote.create).toHaveBeenCalledWith({ data: { postId: 'post-1', userId: 'user-1' } });
    expect(tx.post.update).toHaveBeenCalledWith({
      where: { id: 'post-1' },
      data: { voteCount: { increment: 1 } },
    });
    expect(eventEmitter.emit).toHaveBeenCalledWith('post.voted', {
      postId: 'post-1',
      userId: 'user-1',
    });
  });

  it('removes an existing vote inside a transaction and decrements the count', async () => {
    tx.vote.findUnique.mockResolvedValue({ postId: 'post-1', userId: 'user-1' });
    tx.post.update.mockResolvedValue({ id: 'post-1', voteCount: 9 });

    await expect(service.toggleVote('post-1', 'user-1')).resolves.toEqual({
      voted: false,
      voteCount: 9,
    });

    expect(tx.vote.delete).toHaveBeenCalledWith({
      where: { postId_userId: { postId: 'post-1', userId: 'user-1' } },
    });
    expect(tx.post.update).toHaveBeenCalledWith({
      where: { id: 'post-1' },
      data: { voteCount: { decrement: 1 } },
    });
    expect(eventEmitter.emit).not.toHaveBeenCalledWith('post.voted', expect.anything());
  });

  it('checks tenant access before reading whether the user has voted', async () => {
    votesRepository.findByPostAndUser.mockResolvedValue({
      id: 'vote-1',
      postId: 'post-1',
      userId: 'user-1',
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    await expect(service.hasVoted('post-1', 'user-1')).resolves.toBe(true);

    expect(workspaceAccess.assertPostAccess).toHaveBeenCalledWith('user-1', 'post-1');
    expect(votesRepository.findByPostAndUser).toHaveBeenCalledWith('post-1', 'user-1');
  });
});
