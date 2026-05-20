import { firstValueFrom } from 'rxjs';

import { TransformInterceptor } from './transform.interceptor';

import { createCallHandler, createExecutionContext } from '@/test/test-harness';

describe('TransformInterceptor', () => {
  const interceptor = new TransformInterceptor();

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('wraps regular successful responses in the API envelope', async () => {
    const result = await firstValueFrom(
      interceptor.intercept(
        createExecutionContext(),
        createCallHandler({ id: 'workspace-1', name: 'OrbitFlow' }),
      ),
    );

    expect(result).toEqual({
      data: { id: 'workspace-1', name: 'OrbitFlow' },
      meta: { timestamp: '2026-01-01T00:00:00.000Z' },
    });
  });

  it('moves paginated repository results into the standard envelope', async () => {
    const result = await firstValueFrom(
      interceptor.intercept(
        createExecutionContext(),
        createCallHandler({
          items: [{ id: 'post-1' }],
          meta: {
            page: 2,
            limit: 10,
            totalItems: 21,
            totalPages: 3,
          },
        }),
      ),
    );

    expect(result).toEqual({
      data: [{ id: 'post-1' }],
      meta: {
        page: 2,
        limit: 10,
        totalItems: 21,
        totalPages: 3,
        timestamp: '2026-01-01T00:00:00.000Z',
      },
    });
  });
});
