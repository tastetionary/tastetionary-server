import { FoodCategory, FoodKeyword } from '@domain/food/food.enum';
import {
  getRecommendedFood,
  getFoodOptions,
} from '@domain/food/service/food.service';

export function getRecommendations(param: {
  keywords: FoodKeyword[];
  categories: FoodCategory[];
}) {
  return getRecommendedFood({
    keywords: param.keywords,
    categories: param.categories,
  });
}

export function getFilterOptions() {
  return getFoodOptions();
}
