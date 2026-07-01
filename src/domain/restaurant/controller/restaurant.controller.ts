import {
  Controller,
  HttpCode,
  Injectable,
  UseFilters,
  UseGuards,
  Request,
  Param,
  Query,
  Body,
  ParseIntPipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { HttpExceptionFilter } from '@common/exception/exception.filter';
import { TypedBody, TypedRoute } from '@nestia/core';
import { PageRequestParams, PageResponseDto } from '@common/dto/pagination.dto';
import { BaseResponseDto } from '@common/dto/base.dto';
import { AuthGuard } from '@common/auth/auth.guard';
import {
  AggregateReviewDTO,
  ExternalRestaurantInformationDTO,
  GetRestaurantFilterOption,
  KeywordReviews,
  RestaurantReviewDTO,
  ReviewAggregateData,
  ReviewReportDTO,
  PutRestaurantReviewReactionDTO,
  RestaurantReportOption,
} from '@domain/restaurant/dto/restaurant.dto';
import {
  ExternalRestaurantInformationRecord,
  RestaurantReviewReactionRecord,
  RestaurantReviewRecord,
  RestaurantReviewRxnDistinctCnt,
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
  getNearByRestaurants,
  reactToRestaurantReview,
  getReviewsByUserId,
  getRestaurantReportOptions,
} from '@domain/restaurant/facade/restaurant.facade';
import { REACTION_TYPE } from '@prisma/client';
import {
  deleteRestaurnatReview,
  getRecentReviews,
  reportRestaurantReview,
  updateReview,
} from '@domain/restaurant/service/restaurant.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { validateImageFile, validateContent } from '@common/util';
import { RateLimit, RateLimitGuard } from '@common/rate-limit/rate-limit.guard';

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
}

export interface GetRestaurantsOutput
  extends Omit<ExternalRestaurantInformationRecord, 'id' | 'externalUUID'> {
  id: string;
  externalUUID: string;
  /**
   * aggregate data from review
   * @type RecommendationAggregateReviews
   */
  aggregateReviews: RecommendationAggregateReviews;
}

export interface RecommendationAggregateReviews
  extends Pick<
    AggregateReviewDTO,
    'categories' | 'summaries' | 'keywords' | 'prices'
  > {}

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

export interface MinimumExternalRestaurantInformation {
  /**
   * 식당 ID
   * @example 1
   * @type: string
   */
  id: string;

  /**
   * 식당 이름
   * @example "맛있는 식당"
   * @type: string
   */
  name: string;

  /**
   * 식당 주소
   * @example "서울시 강남구 테헤란로 123"
   * @type string
   */
  address: string;
}

export interface ReviewerSummary {
  /**
   * Reviewer's User ID
   * example: 1
   * @type number
   */
  id: number;

  /**
   * user's nickname
   * example: text_nickname
   * @type string
   */
  nickname: string;

  /**
   * Number of total reviews by the user
   * example: 20
   * @type number
   */
  reviews: number;
}

export interface RestaurantReview
  extends Omit<
    RestaurantReviewRecord,
    | 'id'
    | 'external_restaurant_information_id'
    | 'userId'
    | 'category'
    | 'reactions'
  > {
  id: string;
  external_restaurant_information_id: string;

  /**
   * Reviewer's Info
   * example: { id: 1, nickname: 'test_nickname', reviews: 20 }
   * @type ReviewerSummary
   */
  user: ReviewerSummary;

  /**
   * Restaurant Info
   * example: { id: 1, name: '맛있는 식당', address: '서울시 강남구 테헤란로 123'}
   * @type MinimumExternalRestaurantInformation
   */
  restaurant: MinimumExternalRestaurantInformation;

  /**
   * Distinct number of review reactions for each reaction type (L: '도움이 돼요', D: '도움이 안돼요')
   * example: { [REACTION_TYPE.L]: 10, [REACTION_TYPE.D]: 2 }
   * @type RestaurantReviewRxnDistinctCnt
   */
  reviewReactionCnt: RestaurantReviewRxnDistinctCnt;

  /**
   * Current's user's existing reaction type to the review
   * example: REACTION_TYPE.L
   * @type REACTION_TYPE | null
   */
  userReaction: REACTION_TYPE | null;
}

export interface ReviewsByUser {
  /**
   * Reviewer's Info
   * example: { id: 1, nickname: 'test_nickname', reviews: 20 }
   * @type ReviewerSummary
   */
  user: ReviewerSummary;

  /**
   * List of reviews posted by the reviewer
   * example: []
   * @type Array<Omit<RestaurantReview, 'user'>>
   */
  reviews: Array<Omit<RestaurantReview, 'user'>>;
}

export interface UserReaction
  extends Omit<
    RestaurantReviewReactionRecord,
    'id' | 'createdAt' | 'updatedAt'
  > {}

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
  reviews: Array<Omit<RestaurantReview, 'restaurant'>>;
}

export interface GetReviewsByUserIdOutput {
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

export interface GetRecentReviewOuptut
  extends Array<
    Pick<ExternalRestaurantInformationDTO, 'address' | 'name'> &
      Pick<RestaurantReviewRecord, 'summary'>
  > {}

@Controller('v1/restaurant')
@UseFilters(new HttpExceptionFilter())
@Injectable()
export class RestaurantController {
  /**
   * @tag restaurant
   * @summary get restaurants by condition
   */
  @UseGuards(RateLimitGuard)
  @RateLimit({ ttl: 60, limit: 15 })
  @HttpCode(200)
  @TypedRoute.Post('/recommendation')
  async getRestaurants(
    @TypedBody()
    input: GetRestaurantInput,
  ): Promise<BaseResponseDto<GetRestaurantsOutput>> {
    const maxDistanceMeter = 1_000;

    const data = await getRecommendations({
      latitude: input.latitude,
      longitude: input.longitude,
      maxDistanceMeter: maxDistanceMeter,
      prices: input.prices,
      keywords: input.keywords,
      categories: input.category,
    });

    const { id, externalUUID, ...rest } = data.restaurant;
    const { categories, summaries, keywords, prices } = data.aggregateReviews;

    return new BaseResponseDto({
      id: id.toString(),
      externalUUID: externalUUID.toString(),
      ...rest,
      aggregateReviews: { categories, summaries, keywords, prices },
    });
  }

  /**
   * @tag restaurant
   * @summary get nearby reviewed restaurants
   * @security bearer
   */
  @UseGuards(AuthGuard, RateLimitGuard)
  @RateLimit({ ttl: 60, limit: 20 })
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
   * @summary get recent reviews
   */
  @HttpCode(200)
  @TypedRoute.Get('/review/recent')
  async getRecentRestaurantReviews(): Promise<
    BaseResponseDto<GetRecentReviewOuptut>
  > {
    const count = 3;
    const result = await getRecentReviews(count);

    return new BaseResponseDto(result);
  }

  /**
   * @tag restaurant
   * @summary register restaurant review only for end-user who register activity area
   * @security bearer
   */
  @UseGuards(AuthGuard)
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
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @TypedRoute.Get('/:restaurantId/review')
  async getReviews(
    @Request() req,
    @Param('restaurantId') restaurantId: string,
    @Query() query: PageRequestParams,
  ): Promise<PageResponseDto<GetRestaurantReviewOutput>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const res = await getReviews({
      restaurantId: BigInt(restaurantId),
      userId: req.user.userId,
      page,
      limit,
    });

    const { keywordReviews, data } = res;
    const reviews: Array<Omit<RestaurantReview, 'restaurant'>> = data.map(
      (review) => ({
        ...review,
        id: review.id.toString(),
        external_restaurant_information_id:
          review.external_restaurant_information_id.toString(),
      }),
    );

    return new PageResponseDto(
      {
        keywordReviews,
        reviews: reviews,
      },
      Number(limit),
      res.totalCount,
    );
  }

  /**
   * @tag restaurant
   * @summary get reviews by user id
   * @security bearer
   */
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @TypedRoute.Get('/reviewer/:reviewer_id/review')
  async getRestaurantReviewsByUserId(
    @Request() req,
    @Param('reviewer_id', ParseIntPipe) reviewer_id: number,
  ): Promise<BaseResponseDto<ReviewsByUser>> {
    const { user, reviews } = await getReviewsByUserId({
      reviewerId: reviewer_id,
      userId: req.user.userId,
    });

    return new BaseResponseDto({
      user,
      reviews: reviews.map((review) => ({
        ...review,
        id: review.id.toString(),
        external_restaurant_information_id:
          review.external_restaurant_information_id.toString(),
        restaurant: {
          ...review.restaurant,
          id: review.restaurant.id.toString(),
        },
      })),
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
   * @summary delete review
   * @security bearer
   */
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @TypedRoute.Delete('/review/:reviewId')
  async deleteReview(
    @Request() req,
    @Param('reviewId') reviewId: string,
  ): Promise<BaseResponseDto<object>> {
    const userId = req.user.userId;

    await deleteRestaurnatReview({
      reviewId: Number(reviewId),
      userId: userId,
    });

    return new BaseResponseDto({
      state: 'success',
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
   * @summary get restaurant report option
   */
  @TypedRoute.Get('/review/report/option')
  @HttpCode(200)
  getReportOptions(): BaseResponseDto<Array<RestaurantReportOption>> {
    const res = getRestaurantReportOptions();

    return new BaseResponseDto(res);
  }

  /**
   * @tag restaurant
   * @summary report restaurant review
   * @security bearer
   */
  @UseGuards(AuthGuard)
  @TypedRoute.Post('/review/report')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('image'))
  async reportReview(
    @Request() req,
    @Body() dto: ReviewReportDTO,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<BaseResponseDto<object>> {
    file && validateImageFile(file);
    validateContent(dto.content);

    const userId = req.user.userId;
    await reportRestaurantReview({
      reviewId: Number(dto.reviewId),
      userId,
      content: dto.content,
      category: dto.category as ReviewReportCategory,
      image: file,
    });

    return new BaseResponseDto({
      state: 'success',
    });
  }

  /**
   * @tag restaurant
   * @summary upsert/delete review reaction
   * @security bearer
   */
  @UseGuards(AuthGuard)
  @HttpCode(201)
  @TypedRoute.Put(':restaurantId/review/:reviewId/react')
  async putReviewReaction(
    @Request() req,
    @Param('reviewId', ParseIntPipe) reviewId: number,
    @Param('restaurantId', ParseIntPipe) restaurantId: number,
    @Body() body: PutRestaurantReviewReactionDTO,
  ): Promise<BaseResponseDto<object>> {
    reactToRestaurantReview({
      userId: req.user.userId,
      restaurantId,
      reviewId,
      reactionType: body.reaction_type,
    }).catch(() => {});
    return new BaseResponseDto({ state: 'success' });
  }

  /**
   * @tag restaurant
   * @summary update review
   * @security bearer
   */
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @TypedRoute.Put('/review/:reviewId')
  async updateRestaurantReview(
    @Request() req,
    @Param('reviewId') reviewId: string,
    @TypedBody() input: RestaurantReviewDTO,
  ): Promise<BaseResponseDto<object>> {
    const userId = req.user.userId;
    await updateReview({
      userId,
      reviewId: Number(reviewId),
      dto: input,
    });
    return new BaseResponseDto({ state: 'success' });
  }
}
