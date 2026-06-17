import { createClient, RedisClientType } from 'redis';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { ConfigService } from '@nestjs/config';

type RedisClientInstance = ReturnType<typeof createClient>;

let redisClient: RedisClientInstance | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    const configService = new ConfigurationService(new ConfigService());
    const client = createClient({ url: configService.getRedisConfig() });
    client.on('error', () => {});
    await client.connect();
    redisClient = client;

    const singletons: Array<() => Promise<void>> =
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ((global as any).__REDIS_SINGLETON_CLOSERS__ ??= []);
    singletons.push(() => client.disconnect());
  }
  return redisClient as RedisClientType;
}

export async function closeRedisClient(): Promise<void> {
  const client = redisClient;
  if (client) {
    redisClient = null;
    await client.disconnect();
  }
}
