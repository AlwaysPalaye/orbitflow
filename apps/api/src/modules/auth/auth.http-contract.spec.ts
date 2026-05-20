import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

import {
  configureHttpContractApp,
  createMock,
  requestJson,
  type MockedMethods,
} from '@/test/test-harness';

interface ApiEnvelope<TData> {
  data: TData;
  meta: {
    timestamp: string;
  };
}

interface ErrorEnvelope {
  error: {
    code: string;
    statusCode: number;
    message: string | string[];
    path: string;
    timestamp: string;
  };
}

describe('Auth HTTP contract', () => {
  let app: INestApplication;
  let authService: MockedMethods<Pick<AuthService, 'register' | 'login' | 'refreshTokens'>>;

  beforeAll(async () => {
    authService = createMock<Pick<AuthService, 'register' | 'login' | 'refreshTokens'>>([
      'register',
      'login',
      'refreshTokens',
    ]);

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    app = moduleRef.createNestApplication();
    configureHttpContractApp(app);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registers through HTTP and returns the standard success envelope', async () => {
    authService.register.mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'will@example.com',
        firstName: 'Will',
        lastName: 'Tech',
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    const response = await requestJson<
      ApiEnvelope<{
        user: {
          id: string;
          email: string;
          firstName: string;
          lastName: string;
        };
        accessToken: string;
        refreshToken: string;
      }>
    >(app, '/api/v1/auth/register', {
      method: 'POST',
      body: {
        email: 'will@example.com',
        password: 'StrongPass123!',
        firstName: 'Will',
        lastName: 'Tech',
      },
    });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      data: {
        user: {
          id: 'user-1',
          email: 'will@example.com',
          firstName: 'Will',
          lastName: 'Tech',
        },
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      },
      meta: {
        timestamp: expect.any(String),
      },
    });
    expect(authService.register).toHaveBeenCalledWith({
      email: 'will@example.com',
      password: 'StrongPass123!',
      firstName: 'Will',
      lastName: 'Tech',
    });
  });

  it('rejects invalid registration bodies before they reach the service', async () => {
    const response = await requestJson<ErrorEnvelope>(app, '/api/v1/auth/register', {
      method: 'POST',
      body: {
        email: 'not-an-email',
        password: 'short',
        unexpected: 'blocked',
      },
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual({
      code: 'BAD_REQUEST',
      statusCode: 400,
      message: expect.arrayContaining([
        'email must be an email',
        'password must be longer than or equal to 8 characters',
        'property unexpected should not exist',
      ]),
      path: '/api/v1/auth/register',
      timestamp: expect.any(String),
    });
    expect(authService.register).not.toHaveBeenCalled();
  });

  it('logs in through HTTP with a 200 status and the standard envelope', async () => {
    authService.login.mockResolvedValue({
      user: {
        id: 'user-1',
        email: 'will@example.com',
        firstName: 'Will',
        lastName: 'Tech',
      },
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
    });

    const response = await requestJson<ApiEnvelope<{ accessToken: string; refreshToken: string }>>(
      app,
      '/api/v1/auth/login',
      {
        method: 'POST',
        body: {
          email: 'will@example.com',
          password: 'StrongPass123!',
        },
      },
    );

    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toBe('access-token');
    expect(response.body.data.refreshToken).toBe('refresh-token');
    expect(response.body.meta.timestamp).toEqual(expect.any(String));
  });

  it('refreshes tokens through HTTP with a 200 status and the standard envelope', async () => {
    authService.refreshTokens.mockResolvedValue({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });

    const response = await requestJson<ApiEnvelope<{ accessToken: string; refreshToken: string }>>(
      app,
      '/api/v1/auth/refresh',
      {
        method: 'POST',
        body: {
          refreshToken: 'old-refresh-token',
        },
      },
    );

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      data: {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      },
      meta: {
        timestamp: expect.any(String),
      },
    });
    expect(authService.refreshTokens).toHaveBeenCalledWith('old-refresh-token');
  });
});
