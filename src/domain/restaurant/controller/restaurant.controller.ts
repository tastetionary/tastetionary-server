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
  reportReview,
  getNearByRestaurants,
  reactToRestaurantReview,
  getReviewsByUserId,
} from '@domain/restaurant/facade/restaurant.facade';
import { REACTION_TYPE } from '@prisma/client';
import { getRecentReviews } from '@domain/restaurant/service/restaurant.service';

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
  bookmark: boolean;
  exclude: boolean;
  /**
   * aggregate data from review, if not reviewed, it will be null
   * @type AggregateReviewDTO
   */
  aggregateReviews: AggregateReviewDTO | null;

  reviews: RestaurantReview[];
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
  reviews: RestaurantReview[];
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
   * @security bearer
   */
  @UseGuards(AuthGuard)
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
      prices: input.prices,
      keywords: input.keywords,
      categories: input.category,
      excludeRestaurantIds: input.excludeIds.map((id) => BigInt(id)),
    });

    const reviews = data.reviews.map((d) => {
      const { id, external_restaurant_information_id, ...rest } = d;
      return {
        id: id.toString(),
        external_restaurant_information_id:
          external_restaurant_information_id.toString(),
        ...rest,
      };
    });

    const { id, externalUUID, ...rest } = data.restaurant;

    return new BaseResponseDto({
      id: id.toString(),
      externalUUID: externalUUID.toString(),
      bookmark: data.bookmark,
      exclude: data.exclude,
      ...rest,
      aggregateReviews: data.aggregateReviews,
      reviews: reviews,
    });
  }

  /**
   * @tag restaurant
   * @summary get nearby reviewed restaurants
   * @security bearer
   */
  @UseGuards(AuthGuard)
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
    const reviews: RestaurantReview[] = data.map((review) => ({
      ...review,
      id: review.id.toString(),
      external_restaurant_information_id:
        review.external_restaurant_information_id.toString(),
    }));

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
  @UseGuards(AuthGuard)
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
}
