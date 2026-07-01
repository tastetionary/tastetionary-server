import { Module } from '@nestjs/common';
import { FoodController } from '@domain/food/controller/food.controller';
import { RedisModule } from '@root/src/common/redis/redis.module';
import { RateLimitGuard } from '@common/rate-limit/rate-limit.guard';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [RedisModule],
  controllers: [FoodController],
  providers: [RateLimitGuard, Reflector],
})
export class FoodModule {}
