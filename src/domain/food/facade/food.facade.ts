import { FoodCategory, FoodKeyword } from '@domain/food/food.enum';
import {
  getRecommendedFood,
  getFoodOptions,
  getRecentFoodRecommendations,
  FoodRecommendation,
} from '@domain/food/service/food.service';
import {
  redisGet,
  redisSet,
  redisExpire,
} from '@common/redis/redis.operations';

export async function getRecommendations(param: {
  keywords: FoodKeyword[];
  categories: FoodCategory[];
}) {
  return await getRecommendedFood({
    keywords: param.keywords,
    categories: param.categories,
  });
}

export function getFilterOptions() {
  return getFoodOptions();
}

export async function getRecentRecommendations() {
  return getRecentFoodRecommendations();
}
