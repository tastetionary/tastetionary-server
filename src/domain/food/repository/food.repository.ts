import { Injectable } from '@nestjs/common';
import { FoodCategory, FoodKeyword } from '@domain/food/food.enum';
import * as foodSource from '@domain/food/resource/food.json';

@Injectable()
export class FoodRepository {
  private readonly options = {
    category: Object.values(FoodCategory),
    keywords: Object.values(FoodKeyword),
  };

  async getFoodOptions() {
    return this.options;
  }

  async getFoodsByCondition(param: {
    category: FoodCategory[];
    keywords: FoodKeyword[];
  }) {
    const { category, keywords } = param;
    const foodSource = this.getFoodFromSource();
    const filteredItems = foodSource.data.filter(
      (item) =>
        category.some((categoryItem) => item.category.includes(categoryItem)) &&
        keywords.some((keywordItem) => item.keyword.includes(keywordItem)),
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
