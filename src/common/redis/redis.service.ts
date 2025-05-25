import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('redisClient') private readonly redisPubClient: RedisClientType,
  ) {}

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
}
