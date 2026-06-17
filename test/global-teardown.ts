import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';

declare global {
  // eslint-disable-next-line no-var
  var __POSTGRES_CONTAINER__: StartedPostgreSqlContainer;
}

export default async function globalTeardown(): Promise<void> {
  await global.__POSTGRES_CONTAINER__?.stop();
}
