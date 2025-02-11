import { RestaurantReviewRxnDistinctCnt } from '@domain/restaurant/repository/restaurant.repository';
import {
  RestaurantCategory,
  RestaurantKeyword,
  RestaurantPrice,
  ReviewReportCategory,
} from '@domain/restaurant/restaurant.enum';
import { ApiProperty } from '@nestjs/swagger';
import { REACTION_TYPE } from '@prisma/client';
import { IsDefined, IsEnum, ValidateIf } from 'class-validator';

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
   * example: 10,000원 미만
   * @type RestaurantPrice
   */
  prices: RestaurantPrice[];

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

  /**
   * phone number,
   * example: "010-1234-5678"
   * @type string
   */
  phone?: string;

  /**
   * address,
   * example: "서울시 강남구"
   * @type string
   */
  address?: string;
}

export interface AggregateReviewDTO {
  categories: RestaurantCategory[];
  summaries: string[];
  opinions: string[];
  keywords: string[];
  prices: RestaurantPrice[];
  aggregatePrice: { [index: string]: number };
  revisitRatio: number;
  totalCount: number;
  reviewReactionCnt: RestaurantReviewRxnDistinctCnt;
  userReaction: REACTION_TYPE | null;
}

export interface ReviewAggregateData {
  /**
   * avg price
   * example: 10
   * @type number
   * @minimum 0
   */
  avgPrice: number;

  /**
   * revisit ratio
   * example: 0.5
   * @type number
   */
  revisitRatio: number;

  /**
   * total review count
   * example: 10
   * @type number
   */
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
   * total review count
   * example: 100
   * @type number
   */
  total: number;

  /**
   * keyword count list
   * example: [{name: "한식", count: 10}]
   * @type KeywordCountDTO[]
   */
  keywordCounts: KeywordCountDTO[];

  /**
   * revisit ratio
   * example: 0.5
   * @type number
   */
  revisitRatio: number;
}

export interface KeywordCountDTO {
  /**
   * keyword name
   * example: "한식"
   * @type string
   */
  name: string;

  /**
   * keyword count
   * example: 10
   * @type number
   */
  count: number;
}

export class PutRestaurantReviewReactionDTO {
  @IsDefined()
  @IsEnum(REACTION_TYPE)
  @ValidateIf((_, value) => value !== null)
  @ApiProperty({
    description: '리뷰 리액션(L: 좋아요 | D: 싫어요 | null: 리액션 취소)',
    example: REACTION_TYPE.L,
    enum: REACTION_TYPE,
  })
  reaction_type: REACTION_TYPE | null;
}
