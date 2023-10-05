import { Injectable } from '@nestjs/common';
import { FoodCategory, FoodKeyword } from '@domain/food/food.enum';
import * as foodSource from '@domain/food/resource/food.json';

@Injectable()
export class FoodRepository {
  private readonly options = {
    categories: Object.values(FoodCategory),
    keywords: Object.values(FoodKeyword),
  };

  async getFoodOptions() {
    return this.options;
  }

  async getFoodsByCondition(param: {
    categories: FoodCategory[];
    keywords: FoodKeyword[];
  }) {
    const { categories, keywords } = param;
    const foodSource = this.getFoodFromSource();
    const filteredItems = foodSource.data.filter(
      (item) =>
        categories.some((categoryItem) =>
          item.category.includes(categoryItem),
        ) && keywords.some((keywordItem) => item.keyword.includes(keywordItem)),
    );

    return filteredItems;
  }

  private getFoodFromSource(): {
    data: {
      id: number;
      name: string;
      category: string[];
      keyword: string[];
    }[];
    meta: {
      total: number;
    };
  } {
    return foodSource;
  }
}
