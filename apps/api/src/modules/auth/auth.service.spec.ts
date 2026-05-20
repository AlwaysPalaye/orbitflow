import { ConflictException, Logger, UnauthorizedException } from '@nestjs/common';
import type { EventEmitter2 } from '@nestjs/event-emitter';
import type { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import type { UsersRepository } from '../users/users.repository';

import { AuthService } from './auth.service';

import type { RedisService } from '@/redis/redis.service';
import { createMock } from '@/test/test-harness';

describe('AuthService', () => {
  const usersRepository = createMock<UsersRepository>(['findByEmail', 'create', 'updateLastLogin']);
  const jwtService = createMock<JwtService>(['sign']);
  const redisService = createMock<RedisService>(['get', 'set', 'del']);
  const eventEmitter = createMock<EventEmitter2>(['emit']);

  let service: AuthService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'log').mockImplementation();

    jwtService.sign.mockReturnValue('access-token');
    service = new AuthService(
      usersRepository as unknown as UsersRepository,
      jwtService as unknown as JwtService,
      redisService as unknown as RedisService,
      eventEmitter as unknown as EventEmitter2,
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('registers a new user, hides the password hash, and stores a refresh token', async () => {
    usersRepository.findByEmail.mockResolvedValue(null);
    usersRepository.create.mockResolvedValue({
      id: 'user-1',
      email: 'will@example.com',
      firstName: 'Will',
      lastName: 'Tech',
      passwordHash: 'hashed-password',
      emailVerified: false,
      isActive: true,
      avatarUrl: null,
      lastLoginAt: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const result = await service.register({
      email: 'will@example.com',
      password: 'StrongPass123!',
      firstName: 'Will',
      lastName: 'Tech',
    });

    expect(usersRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'will@example.com',
        firstName: 'Will',
        lastName: 'Tech',
      }),
    );
    expect(usersRepository.create.mock.calls[0]?.[0].passwordHash).not.toBe('StrongPass123!');
    expect(redisService.set).toHaveBeenCalledWith(
      expect.stringMatching(/^refresh:/),
      JSON.stringify({ userId: 'user-1', email: 'will@example.com' }),
      604800,
    );
    expect(eventEmitter.emit).toHaveBeenCalledWith('auth.registered', {
      userId: 'user-1',
      email: 'will@example.com',
    });
    expect(result).toEqual({
      user: {
        id: 'user-1',
        email: 'will@example.com',
        firstName: 'Will',
        lastName: 'Tech',
      },
      accessToken: 'access-token',
      refreshToken: expect.any(String),
    });
  });

  it('rejects registration when the email already exists', async () => {
    usersRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'will@example.com',
      passwordHash: 'hashed-password',
      firstName: 'Will',
      lastName: 'Tech',
      emailVerified: false,
      isActive: true,
      avatarUrl: null,
      lastLoginAt: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    await expect(
      service.register({
        email: 'will@example.com',
        password: 'StrongPass123!',
        firstName: 'Will',
        lastName: 'Tech',
      }),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(usersRepository.create).not.toHaveBeenCalled();
    expect(redisService.set).not.toHaveBeenCalled();
  });

  it('logs in a valid user and emits the login event', async () => {
    const passwordHash = await bcrypt.hash('StrongPass123!', 4);
    usersRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'will@example.com',
      passwordHash,
      firstName: 'Will',
      lastName: 'Tech',
      emailVerified: true,
      isActive: true,
      avatarUrl: null,
      lastLoginAt: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    const result = await service.login({
      email: 'will@example.com',
      password: 'StrongPass123!',
    });

    expect(usersRepository.updateLastLogin).toHaveBeenCalledWith('user-1');
    expect(eventEmitter.emit).toHaveBeenCalledWith('auth.logged_in', { userId: 'user-1' });
    expect(result.accessToken).toBe('access-token');
    expect(result.user).toEqual({
      id: 'user-1',
      email: 'will@example.com',
      firstName: 'Will',
      lastName: 'Tech',
    });
  });

  it('rejects invalid login and emits a failed login event', async () => {
    const passwordHash = await bcrypt.hash('StrongPass123!', 4);
    usersRepository.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'will@example.com',
      passwordHash,
      firstName: 'Will',
      lastName: 'Tech',
      emailVerified: true,
      isActive: true,
      avatarUrl: null,
      lastLoginAt: null,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
      updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    });

    await expect(
      service.login({ email: 'will@example.com', password: 'wrong-password' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(eventEmitter.emit).toHaveBeenCalledWith('auth.login_failed', {
      userId: 'user-1',
      email: 'will@example.com',
    });
    expect(usersRepository.updateLastLogin).not.toHaveBeenCalled();
  });

  it('rotates refresh tokens and invalidates the previous token', async () => {
    redisService.get.mockResolvedValue(
      JSON.stringify({ userId: 'user-1', email: 'will@example.com' }),
    );

    const result = await service.refreshTokens('old-refresh-token');

    expect(redisService.del).toHaveBeenCalledWith('refresh:old-refresh-token');
    expect(redisService.set).toHaveBeenCalledWith(
      expect.stringMatching(/^refresh:/),
      JSON.stringify({ userId: 'user-1', email: 'will@example.com' }),
      604800,
    );
    expect(result).toEqual({
      accessToken: 'access-token',
      refreshToken: expect.any(String),
    });
  });

  it('rejects refresh tokens that are missing or expired', async () => {
    redisService.get.mockResolvedValue(null);

    await expect(service.refreshTokens('missing-token')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );

    expect(redisService.del).not.toHaveBeenCalled();
    expect(redisService.set).not.toHaveBeenCalled();
  });
});
