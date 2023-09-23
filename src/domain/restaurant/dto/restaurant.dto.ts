export interface RestaurantReviewDTO {
  /**
   * restaurant category,
   * example: "한식"
   * @type string
   */
  category: string;

  /**
   * restaurant keywords
   * example: "깨끗해요"
   * @type string
   */
  keywords: string;

  /**
   * example: 10000
   * @type number
   */
  price: number;

  /**
   * one-line summary
   * example: "never go again"
   * @type string
   */
  summary: string;
}
