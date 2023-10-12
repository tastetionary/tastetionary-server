import { FoodCategory, FoodKeyword } from '@domain/food/food.enum';

export interface FoodOption {
  /**
   * food category,
   * example: ["한식"]
   * @type FoodCategory[]
   */
  categories: FoodCategory[];

  /**
   * food keywords
   * example: ["깨끗해요"]
   * @type FoodKeyword[]
   */
  keywords: FoodKeyword[];
}

export interface FoodCategoryOption {
  /**
   * food category id
   * example: 0
   * @type number
   */
  id: number;

  /**
   * food category keyword
   * example: "한식"
   * @type FoodCategory
   */
  name: FoodCategory;

  /**
   * category icon
   * example: "menu_korean"
   * @type string
   */
  icon: string;
}

export interface FoodKeywordOption {
  /**
   * food keyword id
   * example: 0
   * @type number
   */
  id: number;

  /**
   * food keyword
   * example: "매콤한"
   * @type FoodKeyword
   */
  name: FoodKeyword;
}

export interface GetFoodFilterOption {
  /**
   * food categories
   * example: [{id: 0, name: "한식", icon: "menu_korean"}]
   * @type FoodCategoryOption[]
   */
  categories: FoodCategoryOption[];

  /**
   * food keywords
   * example: [{id: 0, name: "매콤한"}]
   * @type FoodKeywordOption[]
   */
  keywords: FoodKeywordOption[];
}

export interface GetFoodOutput {
  /**
   * recommended food id
   * example: 1
   * @type number
   */
  id: number;

  /**
   * recommended food
   * example: "김치찌개"
   * @type string
   */
  name: string;
}
