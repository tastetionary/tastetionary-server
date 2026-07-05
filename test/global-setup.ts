import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import { execSync } from 'child_process';
import * as path from 'path';
import * as dotenv from 'dotenv';

declare global {
  var __POSTGRES_CONTAINER__: StartedPostgreSqlContainer;
  var __REDIS_CONTAINER__: StartedRedisContainer;
}

export default async function globalSetup(): Promise<void> {
  dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

  const [pgContainer, redisContainer] = await Promise.all([
    new PostgreSqlContainer('postgis/postgis')
      .withDatabase('taste')
      .withUsername('postgres')
      .withPassword('postgres')
      .start(),
    new RedisContainer('redis:7-alpine').start(),
  ]);

  process.env.DATABASE_URL = pgContainer.getConnectionUri();
  process.env.REDIS_URL = redisContainer.getConnectionUrl();

  execSync('npx prisma migrate deploy', {
    env: { ...process.env },
    cwd: path.resolve(__dirname, '..'),
    stdio: 'inherit',
  });

  global.__POSTGRES_CONTAINER__ = pgContainer;
  global.__REDIS_CONTAINER__ = redisContainer;
}
