import { Injectable } from '@nestjs/common';
import { FoodRepository } from '@domain/food/repository/food.repository';
import { FoodCategory, FoodKeyword } from '@domain/food/food.enum';
import { getRandomItem } from '@root/src/common/util';

@Injectable()
export class FoodService {
  constructor(private repo: FoodRepository) {}

  async getFoodOptions() {
    return await this.repo.getFoodOptions();
  }

  async getRecommendedFood(param: {
    keywords: FoodKeyword[];
    categories: FoodCategory[];
  }) {
    const food = await this.repo.getFoodsByCondition({
      keywords: param.keywords,
      categories: param.categories,
    });

    const randomFood = getRandomItem(food);
    return randomFood;
  }
}
