import { Injectable } from '@nestjs/common';
import {
  FoodCategory,
  FoodCategoryIcons,
  FoodKeyword,
} from '@domain/food/food.enum';
import * as foodSource from '@domain/food/resource/food.json';

@Injectable()
export class FoodRepository {
  private readonly options = {
    categories: Object.values(FoodCategory),
    keywords: Object.values(FoodKeyword),
  };

  async getFoodOptions() {
    const categories = this.options.categories.map((category, index) => {
      return {
        id: index,
        name: category,
        icon: FoodCategoryIcons[category],
      };
    });

    const keywords = this.options.keywords.map((keyword, index) => {
      return {
        id: index,
        name: keyword,
      };
    });

    return {
      categories,
      keywords,
    };
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
