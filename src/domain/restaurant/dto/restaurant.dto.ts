import {
  RestaurantCategory,
  RestaurantKeyword,
  RestaurantPrice,
  ReviewReportCategory,
} from '@domain/restaurant/restaurant.enum';

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

  /**
   * want to revisit?
   * example: "Y"
   * @type string
   */
  opinion: 'Y' | 'N' | string;
}

export interface ExternalRestaurantInformationDTO {
  /**
   * uuid get from external api,
   * example: 9391929
   * @type number
   */
  externalUUID: number;

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

export interface AggregateReviewDTO {
  categories: RestaurantCategory[];
  summaries: string[];
  opinions: string[];
  keywords: string[];
  prices: number[];
  aggregatePrice: { [index: string]: number };
  revisitRatio: number;
  totalCount: number;
}

export interface RestaurantCategoryOption {
  /**
   * food category id
   * example: 0
   * @type number
   */
  id: number;

  /**
   * food category keyword
   * example: "한식"
   * @type RestaurantCategory
   */
  name: RestaurantCategory;

  /**
   * category icon
   * example: "menu_korean"
   * @type string
   */
  icon: string;
}

export interface RestaurantKeywordOption {
  /**
   * food keyword id
   * example: 0
   * @type number
   */
  id: number;

  /**
   * food keyword
   * example: "깨끗해요"
   * @type RestaurantKeyword
   */
  name: string;
}

export interface RestaurantPriceOption {
  /**
   * food price id
   * example: 0
   * @type number
   */
  id: number;

  /**
   * food price
   * example: "~10,000원"
   * @type RestaurantPrice
   */
  name: RestaurantPrice;
}

export interface GetRestaurantFilterOption {
  /**
   * restaurant categories
   * example: [{id: 0, name: "한식", icon: "menu_korean"}]
   * @type RestaurantCategoryOption[]
   */
  categories: RestaurantCategoryOption[];

  /**
   * restaurant keywords
   * example: [{id: 0, name: "깨끗해요"}]
   * @type RestaurantKeywordOption[]
   */
  keywords: RestaurantKeywordOption[];

  /**
   * restaurant prices
   * example: [{id: 0, name: "~10,000원"}]
   * @type RestaurantPriceOption[]
   */
  prices: RestaurantPriceOption[];
}

export interface ReviewReportDTO {
  /**
   * review id
   * example: 10000
   * @type number
   */
  reviewId: number;

  /**
   * report content
   * example: "content"
   * @type string
   */
  content: string;

  /**
   * report category
   * example: "SPAM"
   * @type ReviewReportCategory
   */
  category: ReviewReportCategory;
}

export interface KeywordReviews {
  /**
   * keyword counts
   * example: {"깨끗해요": 3}
   * @type { [index: string]: number }
   */
  keywordCounts: Record<string, number>;

  /**
   * revisit ratio
   * example: 0.5
   * @type number
   */
  revisitRatio: number;
}
