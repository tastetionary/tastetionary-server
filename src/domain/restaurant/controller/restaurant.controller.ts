import {
  Controller,
  HttpCode,
  Injectable,
  UseFilters,
  UseGuards,
  Request,
  Param,
  Query,
} from '@nestjs/common';
import { HttpExceptionFilter } from '@common/exception/exception.filter';
import { TypedBody, TypedRoute } from '@nestia/core';
import { BaseResponseDto } from '@common/dto/base.dto';
import { JwtAuthGuard } from '@common/auth/auth.guard';
import {
  AggregateReviewDTO,
  ExternalRestaurantInformationDTO,
  GetRestaurantFilterOption,
  KeywordReviews,
  RestaurantReviewDTO,
  ReviewAggregateData,
  ReviewReportDTO,
} from '@domain/restaurant/dto/restaurant.dto';
import {
  ExternalRestaurantInformationRecord,
  RestaurantReviewRecord,
} from '@domain/restaurant/repository/restaurant.repository';
import {
  RestaurantCategory,
  ReviewReportCategory,
} from '@domain/restaurant/restaurant.enum';
import {
  getFilterOptions,
  getReviewFilterOptions,
  getRecommendations,
  getReviews,
  registerReview,
  reportReview,
  getNearByRestaurants,
} from '@domain/restaurant/facade/restaurant.facade';

export interface RegisterRestaurantReviewInput {
  /**
   * review data
   * @type RestaurantReviewDTO
   */
  review: RestaurantReviewDTO;

  /**
   * external restaurant information for register
   * @type ExternalRestaurantInformationDTO
   */
  external: ExternalRestaurantInformationDTO;
}

export interface GetRestaurantInput
  extends Omit<RestaurantReviewDTO, 'summary' | 'opinion' | 'category'> {
  /**
   * restaurant category array,
   * example: ["한식"]
   * @type RestaurantCategory
   */
  category: RestaurantCategory[];

  /**
   * already recommended restaurant ids, it will be ignored
   * example: 10000
   * @type number
   */
  excludeIds: number[];
}

export interface GetRestaurantsOutput
  extends Omit<ExternalRestaurantInformationRecord, 'id' | 'externalUUID'> {
  id: string;
  externalUUID: string;
  /**
   * aggregate data from review, if not reviewed, it will be null
   * @type AggregateReviewDTO
   */
  aggregateReviews: AggregateReviewDTO | null;
}

export interface GetNearByRestaurantsOutput
  extends Omit<
    ExternalRestaurantInformationRecord,
    'id' | 'externalUUID' | 'referenceLink' | 'createdAt' | 'updatedAt'
  > {
  restaurantId: string;

  category: RestaurantCategory;
  /**
   * aggregate data from review, if not reviewed, it will be null
   * @type ReviewAggregateData
   */
  aggregateReviews: ReviewAggregateData;
}

export interface RestaurantReview
  extends Omit<
    RestaurantReviewRecord,
    | 'id'
    | 'external_restaurant_information_id'
    | 'userId'
    | 'category'
    | 'price'
  > {
  id: string;
  external_restaurant_information_id: string;
  user: {
    id: number;
    nickname: string;
    reviews: number;
  };
}

export interface GetRestaurantReviewOutput {
  /**
   * keyword reviews
   * @type KeywordReviews
   */
  keywordReviews: KeywordReviews;
  /**
   * restaurant reviews
   * @type RestaurantReview
   */
  reviews: RestaurantReview[];
}

@Controller('v1/restaurant')
@UseFilters(new HttpExceptionFilter())
@Injectable()
export class RestaurantController {
  /**
   * @tag restaurant
   * @summary get restaurants by condition
   * @security bearer
   */
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @TypedRoute.Post('/recommendation')
  async getRestaurants(
    @Request() req,
    @TypedBody()
    input: GetRestaurantInput,
  ): Promise<BaseResponseDto<GetRestaurantsOutput>> {
    const userId = req.user.userId;
    const maxDistanceMeter = 1_000;

    const data = await getRecommendations({
      userId,
      maxDistanceMeter: maxDistanceMeter,
      ltePrice: input.price,
      keywords: input.keywords,
      categories: input.category,
      excludeRestaurantIds: input.excludeIds.map((id) => BigInt(id)),
    });

    const { id, externalUUID, ...rest } = data.restaurant;
    return new BaseResponseDto({
      id: id.toString(),
      externalUUID: externalUUID.toString(),
      ...rest,
      aggregateReviews: data.aggregateReviews,
    });
  }

  /**
   * @tag restaurant
   * @summary get nearby reviewed restaurants
   * @security bearer
   */
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @TypedRoute.Get('/nearby')
  async getNearByRestaurants(
    @Request() req,
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
  ): Promise<BaseResponseDto<GetNearByRestaurantsOutput[]>> {
    const userId = req.user.userId;
    const maxDistanceMeter = 1_000;

    const data = await getNearByRestaurants({
      userId,
      maxDistanceMeter: maxDistanceMeter,
      latitude,
      longitude,
    });

    const result = data.map((d) => {
      const { id, ...rest } = d;
      return {
        restaurantId: id.toString(),
        ...rest,
        aggregateReviews: d.aggregateReviews,
      };
    });

    return new BaseResponseDto(result);
  }

  /**
   * @tag restaurant
   * @summary register restaurant review only for end-user who register activity area
   * @security bearer
   */
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @TypedRoute.Post('/review')
  async registerRestaurantReview(
    @Request() req,
    @TypedBody()
    input: RegisterRestaurantReviewInput,
  ): Promise<BaseResponseDto<object>> {
    const userId = req.user.userId;
    await registerReview({
      userId,
      externalDto: input.external,
      dto: input.review,
    });
    return new BaseResponseDto({ state: 'success' });
  }

  /**
   * @tag restaurant
   * @summary get restaurant reviews by restaurant id
   * @security bearer
   */
  @UseGuards(JwtAuthGuard)
  @HttpCode(200)
  @TypedRoute.Get('/:restaurantId/review')
  async getReviews(
    @Param('restaurantId') restaurantId: string,
  ): Promise<BaseResponseDto<GetRestaurantReviewOutput>> {
    const res = await getReviews({
      restaurantId: BigInt(restaurantId),
    });

    const { keywordReviews, data } = res;
    const reviews: RestaurantReview[] = data.map((review) => ({
      ...review,
      id: review.id.toString(),
      external_restaurant_information_id:
        review.external_restaurant_information_id.toString(),
    }));

    return new BaseResponseDto({
      keywordReviews,
      reviews: reviews,
    });
  }

  /**
   * @tag restaurant
   * @summary get restaurant filter option
   */
  @HttpCode(200)
  @TypedRoute.Get('option')
  getOptions(): BaseResponseDto<GetRestaurantFilterOption> {
    const res = getFilterOptions();

    return new BaseResponseDto({
      categories: res.categories,
      keywords: res.keywords,
      prices: res.prices,
    });
  }

  /**
   * @tag restaurant
   * @summary get restaurant filter option
   */
  @TypedRoute.Get('/review/option')
  @HttpCode(200)
  getReviewOptions(): BaseResponseDto<GetRestaurantFilterOption> {
    const res = getFilterOptions();

    return new BaseResponseDto({
      categories: res.categories,
      keywords: res.keywords,
      prices: res.prices,
    });
  }

  /**
   * @tag restaurant
   * @summary report restaurant review
   */
  @UseGuards(JwtAuthGuard)
  @TypedRoute.Post('/review/report')
  @HttpCode(201)
  async reportReview(
    @Request() req,
    @TypedBody() dto: ReviewReportDTO,
  ): Promise<BaseResponseDto<object>> {
    const userId = req.user.userId;
    await reportReview({
      reviewId: dto.reviewId,
      userId,
      content: dto.content,
      category: dto.category as ReviewReportCategory,
    });

    return new BaseResponseDto({
      state: 'success',
    });
  }
}
