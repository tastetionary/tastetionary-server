import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('redisClient') private readonly redisPubClient: RedisClientType,
  ) {}
}
