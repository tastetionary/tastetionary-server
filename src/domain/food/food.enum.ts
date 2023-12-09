export enum FoodCategory {
  ALL = '전체',
  KOREAN = '한식',
  CHINESE = '중식',
  WESTERN = '양식',
  JAPANESE = '일식',
  FAST_FOOD = '패스트푸드',
  SNACK = '분식',
  ASIAN = '아시아식',
  SALAD = '샐러드',
  CAFE_AND_DESERT = '카페/디저트',
}

export enum FoodKeyword {
  ALL = '전체',
  SPICY = '매콤한',
  SAVORY = '고소한',
  LIGHT = '가벼운',
  COLD = '차가운',
  RICH = '국물이 진한',
  CLEAN = '깔끔한',
  WARM = '따뜻한',
  SWEET = '달콤한',
  SOUR = '상큼한',
  BEST_FOR_HANGOVER = '해장에 제격',
  GREASY = '느끼한',
  FLAVORFUL = '풍미가 있는',
}

export const FoodCategoryIcons: Record<FoodCategory, string> = {
  [FoodCategory.ALL]: 'menu_all',
  [FoodCategory.KOREAN]: 'menu_korean',
  [FoodCategory.CHINESE]: 'menu_chinese',
  [FoodCategory.WESTERN]: 'menu_western',
  [FoodCategory.JAPANESE]: 'menu_japanese',
  [FoodCategory.FAST_FOOD]: 'menu_fastfood',
  [FoodCategory.SNACK]: 'menu_snack',
  [FoodCategory.ASIAN]: 'menu_asian',
  [FoodCategory.SALAD]: 'menu_salad',
  [FoodCategory.CAFE_AND_DESERT]: 'menu_cafedessert',
};
