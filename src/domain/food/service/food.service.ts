import { Injectable } from '@nestjs/common';
import { FoodRepository } from '@domain/food/repository/food.repository';
import { FoodCategory, FoodKeyword } from '@domain/food/food.enum';
import { getRandomItem } from '@root/src/common/util';
import { winstonLogger as dbLogger } from '@utils/winston.config';

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
    const foods = await this.repo.getFoodsByCondition({
      keywords: param.keywords,
      categories: param.categories,
    });

    if (foods.length === 0) {
      dbLogger.log('info', 'no-food-result', {
        type: 'food',
        keyword: param.keywords.join(','),
        category: param.categories.join(','),
      });
      return null;
    }

    return getRandomItem(foods);
  }
}
