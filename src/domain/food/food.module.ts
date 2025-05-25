import { Module } from '@nestjs/common';
import { FoodController } from '@domain/food/controller/food.controller';
import { RedisModule } from '@root/src/common/redis/redis.module';

@Module({
  imports: [RedisModule],
  controllers: [FoodController],
  providers: [],
})
export class FoodModule {}
