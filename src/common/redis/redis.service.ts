import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  constructor(
    @Inject('redisClient') private readonly redisPubClient: RedisClientType,
  ) {}

  async onModuleDestroy(): Promise<void> {
    await this.redisPubClient.quit();
  }

  async get(key: string): Promise<string | null> {
    return this.redisPubClient.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.redisPubClient.set(key, value);
  }

  async expire(key: string, seconds: number): Promise<boolean> {
    return this.redisPubClient.expire(key, seconds);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.redisPubClient.keys(pattern);
  }

  async ping(): Promise<string> {
    return this.redisPubClient.ping();
  }
}
