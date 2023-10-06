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

export interface GetFoodOutput {
  /**
   * recommended food
   * example: "김치찌개"
   * @type string
   */
  name: string;
}
