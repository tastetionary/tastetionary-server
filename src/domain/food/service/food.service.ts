import {
  getFoodOptionsRecord,
  getFoodsByConditions,
  getFoodRecord,
} from '@domain/food/repository/food.repository';
import { FoodCategory, FoodKeyword } from '@domain/food/food.enum';
import { getRandomItem } from '@root/src/common/util';
import { EmptyContentException } from '@root/src/common/exception/internal.exception';
import {
  redisGet,
  redisSet,
  redisExpire,
} from '@common/redis/redis.operations';
import { GetFoodOutput } from '@domain/food/dto/food.dto';

export interface FoodRecommendation {
  id: number;
  count: number;
  lastRecommendedAt: number;
}

export async function getRecommendedFood(param: {
  keywords: FoodKeyword[];
  categories: FoodCategory[];
}) {
  const foods = getFoodsByConditions({
    keywords: param.keywords,
    categories: param.categories,
  });

  if (foods.length === 0) {
    throw new EmptyContentException('검색 조건에 부합 되는 음식이 없습니다.');
  }

  const recommendedFood = getRandomItem(foods);
  await saveFoodRecommendation(recommendedFood.id);

  return recommendedFood;
}

export function getFoodOptions() {
  return getFoodOptionsRecord();
}

async function saveFoodRecommendation(foodId: number): Promise<void> {
  const redisKey = 'food:recommendations';
  const recommendations = await redisGet(redisKey);
  const now = Date.now();

  let updatedRecommendations: FoodRecommendation[];
  if (recommendations) {
    const parsedRecommendations = JSON.parse(
      recommendations,
    ) as FoodRecommendation[];
    const existingRecommendation = parsedRecommendations.find(
      (rec) => rec.id === foodId,
    );

    if (existingRecommendation) {
      updatedRecommendations = parsedRecommendations.map((rec) =>
        rec.id === foodId
          ? { ...rec, count: rec.count + 1, lastRecommendedAt: now }
          : rec,
      );
    } else {
      updatedRecommendations = [
        ...parsedRecommendations,
        {
          id: foodId,
          count: 1,
          lastRecommendedAt: now,
        },
      ];
    }
  } else {
    updatedRecommendations = [
      {
        id: foodId,
        count: 1,
        lastRecommendedAt: now,
      },
    ];
  }

  await redisSet(redisKey, JSON.stringify(updatedRecommendations));
  await redisExpire(redisKey, 86400);
}

export async function getRecentFoodRecommendations(): Promise<GetFoodOutput[]> {
  const redisKey = 'food:recommendations';
  const recommendations = await redisGet(redisKey);

  if (!recommendations) {
    return [];
  }

  const parsedRecommendations = JSON.parse(
    recommendations,
  ) as FoodRecommendation[];
  const foodSource = getFoodRecord();

  return parsedRecommendations
    .sort((a, b) => b.lastRecommendedAt - a.lastRecommendedAt)
    .slice(0, 8)
    .map((rec) => {
      const food = foodSource.data.find((f) => f.id === rec.id);
      return {
        id: rec.id,
        name: food?.name || '',
      };
    });
}
