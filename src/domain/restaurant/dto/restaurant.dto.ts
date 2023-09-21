import { RestaurantCategory } from '@domain/restaurant/restaurant.enum';

export interface RestaurantReviewDTO {
  /**
   * restaurant category,
   * example: "한식"
   * @type RestaurantCategory
   */
  category: RestaurantCategory;

  /**
   * restaurant keywords
   * example: "깨끗해요"
   * @type string[]
   */
  keywords: string[];

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

export interface ExternalRestaurantInformationDTO {
  /**
   * uuid get from external api,
   * example: 9391929
   * @type number
   */
  externalUUID: bigint;

  /**
   * restaurant name,
   * example: "some"
   * @type string
   */
  name: string;

  /**
   * latitude,
   * example: 37.1234
   * @type number
   */
  latitude: number;

  /**
   * longitude,
   * example: 127.1123
   * @type number
   */
  longitude: number;

  /**
   * link to check,
   * example: "https://www.naver.com/some-restaurant"
   * @type string
   */
  referenceLink?: string;
}
