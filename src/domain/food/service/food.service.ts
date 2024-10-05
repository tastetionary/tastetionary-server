import {
  getFoodOptionsRecord,
  getFoodsByConditions,
} from '@domain/food/repository/food.repository';
import { FoodCategory, FoodKeyword } from '@domain/food/food.enum';
import { getRandomItem } from '@root/src/common/util';

import { EmptyContentException } from '@root/src/common/exception/internal.exception';

export function getRecommendedFood(param: {
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

  return getRandomItem(foods);
}

export function getFoodOptions() {
  return getFoodOptionsRecord();
}
