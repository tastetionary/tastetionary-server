import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { execSync } from 'child_process';
import * as path from 'path';

declare global {
  // eslint-disable-next-line no-var
  var __POSTGRES_CONTAINER__: StartedPostgreSqlContainer;
}

export default async function globalSetup(): Promise<void> {
  const container = await new PostgreSqlContainer('postgis/postgis')
    .withDatabase('taste')
    .withUsername('postgres')
    .withPassword('postgres')
    .start();

  process.env.DATABASE_URL = container.getConnectionUri();

  execSync('npx prisma migrate deploy', {
    env: { ...process.env },
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
  });

  global.__POSTGRES_CONTAINER__ = container;
}
