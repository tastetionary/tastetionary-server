import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { StartedRedisContainer } from '@testcontainers/redis';

declare global {
  // eslint-disable-next-line no-var
  var __POSTGRES_CONTAINER__: StartedPostgreSqlContainer;
  // eslint-disable-next-line no-var
  var __REDIS_CONTAINER__: StartedRedisContainer;
  // eslint-disable-next-line no-var
  var __REDIS_SINGLETON_CLOSERS__: Array<() => Promise<void>>;
}

export default async function globalTeardown(): Promise<void> {
  const closers: Array<() => Promise<void>> = global.__REDIS_SINGLETON_CLOSERS__ ?? [];
  await Promise.allSettled(closers.map((close) => close()));

  await Promise.all([
    global.__POSTGRES_CONTAINER__?.stop(),
    global.__REDIS_CONTAINER__?.stop(),
  ]);
}
