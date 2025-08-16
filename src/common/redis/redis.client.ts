import { createClient, RedisClientType } from 'redis';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { ConfigService } from '@nestjs/config';

let redisClient: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (!redisClient) {
    const configService = new ConfigurationService(new ConfigService());
    redisClient = createClient({
      url: configService.getRedisConfig(),
    });
    await redisClient.connect();
  }
  return redisClient;
}

export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}
