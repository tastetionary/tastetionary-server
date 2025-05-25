import {
  FoodCategory,
  FoodCategoryIcons,
  FoodKeyword,
} from '@domain/food/food.enum';
import * as foodSource from '@domain/food/resource/food.json';

export function getFoodsByConditions(param: {
  categories: FoodCategory[];
  keywords: FoodKeyword[];
}) {
  const { categories, keywords } = param;
  const foodSource = getFoodRecord();
  const filteredItems = foodSource.data.filter(
    (item) =>
      categories.some((categoryItem) => item.category.includes(categoryItem)) &&
      keywords.some((keywordItem) => item.keyword.includes(keywordItem)),
  );

  return filteredItems;
}

export function getFoodRecord() {
  return foodSource;
}

export function getFoodOptionsRecord() {
  const categories = Object.values(FoodCategory).map((category, index) => {
    return {
      id: index,
      name: category,
      icon: FoodCategoryIcons[category],
    };
  });

  const keywords = Object.values(FoodKeyword).map((keyword, index) => {
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
