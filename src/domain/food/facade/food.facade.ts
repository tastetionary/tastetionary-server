import { FoodCategory, FoodKeyword } from '@domain/food/food.enum';
import {
  getRecommendedFood,
  getFoodOptions,
  getRecentFoodRecommendations,
  FoodRecommendation,
} from '@domain/food/service/food.service';
import { RedisService } from '@root/src/common/redis/redis.service';

export async function getRecommendations(
  redisService: RedisService,
  param: {
    keywords: FoodKeyword[];
    categories: FoodCategory[];
  },
) {
  return await getRecommendedFood(redisService, {
    keywords: param.keywords,
    categories: param.categories,
  });
}

export function getFilterOptions() {
  return getFoodOptions();
}

export async function getRecentRecommendations(redisService: RedisService) {
  return getRecentFoodRecommendations(redisService);
}
