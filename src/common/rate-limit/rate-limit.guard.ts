import {
  CanActivate,
  ExecutionContext,
  Injectable,
  HttpException,
  HttpStatus,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from '@common/redis/redis.service';

export const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitOptions {
  ttl: number;
  limit: number;
}

export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private readonly redis: RedisService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const options = this.reflector.get<RateLimitOptions>(
      RATE_LIMIT_KEY,
      context.getHandler(),
    );

    if (!options) return true;

    const request = context.switchToHttp().getRequest();
    const userId: number | undefined = request.user?.userId;
    const ip: string = request.ip ?? 'unknown';
    const identifier = userId ?? ip;
    const handlerName = context.getHandler().name;
    const key = `rl:${handlerName}:${identifier}`;

    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.expire(key, options.ttl);
    }

    if (count > options.limit) {
      throw new HttpException(
        { message: 'Too many requests. Please try again later.' },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
