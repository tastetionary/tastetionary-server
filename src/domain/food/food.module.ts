import { Module } from '@nestjs/common';
import { FoodController } from '@domain/food/controller/food.controller';

@Module({
  controllers: [FoodController],
  providers: [],
})
export class FoodModule {}
