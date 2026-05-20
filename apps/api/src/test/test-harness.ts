import { ValidationPipe } from '@nestjs/common';
import type { CallHandler, ExecutionContext, INestApplication } from '@nestjs/common';
import { of } from 'rxjs';

import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';

export type MockedMethods<T extends object> = {
  [K in keyof T]: T[K] extends (...args: infer Args extends unknown[]) => infer Return
    ? jest.Mock<Return, Args>
    : T[K];
};

export function createMock<T extends object>(methods: Array<keyof T>): MockedMethods<T> {
  const mock = {} as MockedMethods<T>;

  for (const method of methods) {
    mock[method] = jest.fn() as MockedMethods<T>[typeof method];
  }

  return mock;
}

export function createCallHandler<T>(value: T): CallHandler<T> {
  return {
    handle: () => of(value),
  };
}

export function createExecutionContext(): ExecutionContext {
  return {} as ExecutionContext;
}

export function createTransactionMock<TClient extends object>(client: TClient) {
  return jest.fn(async <TResult>(callback: (tx: TClient) => Promise<TResult>) => {
    return callback(client);
  });
}

export function configureHttpContractApp(app: INestApplication): void {
  app.setGlobalPrefix('api/v1', {
    exclude: ['health'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());
}

export async function requestJson<TBody = unknown>(
  app: INestApplication,
  path: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  } = {},
): Promise<{ status: number; body: TBody }> {
  const server = app.getHttpServer() as {
    address: () => string | { port: number } | null;
    listening: boolean;
  };

  if (!server.listening) {
    await app.listen(0);
  }

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('HTTP contract app did not bind to a local port');
  }

  const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'content-type': 'application/json',
      ...options.headers,
    },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });

  return {
    status: response.status,
    body: (await response.json()) as TBody,
  };
}
