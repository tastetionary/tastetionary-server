import {
  createReview,
  getRecommendedRestaurant,
  getNearyByRestaurants,
  getSearchOptions,
  getReviewOptions,
  getRestaurantReviews,
  reportRestaurantReview,
  upsertRestaurantReviewRxn,
  getRestaurantReviewsByUserId,
  getReportOptions,
} from '@domain/restaurant/service/restaurant.service';
import { ErrorCodeEnum, ErrorSubCategoryEnum } from '@common/exception/enum';
import { CallerWrongDomainRuleException } from '@common/exception/internal.exception';
import {
  getPreferenceRestaurant,
  isRestaurantInUserPreferences,
  searchAreas,
} from '@domain/user/service/user.service';
import {
  ExternalRestaurantInformationDTO,
  RestaurantReviewDTO,
} from '@domain/restaurant/dto/restaurant.dto';
import {
  RestaurantCategory,
  RestaurantPrice,
  ReviewReportCategory,
} from '@domain/restaurant/restaurant.enum';
import { REACTION_TYPE } from '@prisma/client';
import { PreferenceCategory } from '@domain/user/user.enum';
import { RedisService } from '@common/redis/redis.service';

interface Recommendation {
  id: string;
  expiredAt: number;
}

export async function getRecommendations(
  redisService: RedisService,
  param: {
    userId: number;
    maxDistanceMeter: number;
    keywords: string[];
    prices: RestaurantPrice[];
    categories: RestaurantCategory[];
  },
) {
  const userAreas = await searchAreas(param.userId);
  if (!userAreas) {
    throw new CallerWrongDomainRuleException(
      ErrorSubCategoryEnum.NO_DATA,
      'no area',
      ErrorCodeEnum.MISSING_USER_AREA,
    );
  }

  const redisKey = `user:${param.userId}:recommendations`;
  const recentRecommendations = await getRecentRecommendations(
    redisService,
    redisKey,
  );
  const recentIds = recentRecommendations.map((rec) => BigInt(rec.id));

  const excludeRestaurants = await getPreferenceRestaurant(
    param.userId,
    PreferenceCategory.EXCLUDED,
  );
  const excludeIds = excludeRestaurants.map((restaurant) =>
    BigInt(restaurant.id),
  );
  const excludeRestaurantIds = recentIds.concat(excludeIds);

  const res = await getRecommendedRestaurant({
    userAreas,
    excludeRestaurantIds,
    ...param,
  });

  await saveNewRecommendation(
    redisService,
    redisKey,
    res.restaurant.id.toString(),
  );
  const isBookmarked = await isRestaurantInUserPreferences(
    param.userId,
    PreferenceCategory.BOOKMARK,
    Number(res.restaurant.id),
  );
  const isExcluded = await isRestaurantInUserPreferences(
    param.userId,
    PreferenceCategory.EXCLUDED,
    Number(res.restaurant.id),
  );

  const reviews = (
    await getRestaurantReviews(res.restaurant.id, param.userId)
  ).data.slice(0, 3);

  return {
    ...res,
    reviews: reviews,
    bookmark: isBookmarked,
    exclude: isExcluded,
  };
}

async function getRecentRecommendations(
  redisService: RedisService,
  redisKey: string,
): Promise<Recommendation[]> {
  const recommendations = await redisService.get(redisKey);
  if (!recommendations) return [];

  const parsedRecommendations = JSON.parse(recommendations) as Recommendation[];
  const now = Date.now();

  const validRecommendations = parsedRecommendations.filter(
    (rec) => rec.expiredAt > now,
  );

  if (validRecommendations.length !== parsedRecommendations.length) {
    await redisService.set(redisKey, JSON.stringify(validRecommendations));
    await redisService.expire(redisKey, 5 * 60);
  }

  return validRecommendations;
}

async function saveNewRecommendation(
  redisService: RedisService,
  redisKey: string,
  restaurantId: string,
): Promise<void> {
  const recommendations = await redisService.get(redisKey);
  const newRecommendation: Recommendation = {
    id: restaurantId,
    expiredAt: Date.now() + 5 * 60 * 1000,
  };

  const updatedRecommendations = recommendations
    ? [...JSON.parse(recommendations), newRecommendation]
    : [newRecommendation];

  await redisService.set(redisKey, JSON.stringify(updatedRecommendations));
  await redisService.expire(redisKey, 5 * 60);
}

export async function getNearByRestaurants(param: {
  userId: number;
  maxDistanceMeter: number;
  latitude: number;
  longitude: number;
}) {
  const userAreas = await searchAreas(param.userId);
  if (!userAreas) {
    throw new CallerWrongDomainRuleException(
      ErrorSubCategoryEnum.NO_DATA,
      'no area',
      ErrorCodeEnum.MISSING_USER_AREA,
    );
  }

  return getNearyByRestaurants({ userAreas, ...param });
}

export async function registerReview(param: {
  userId: number;
  externalDto: ExternalRestaurantInformationDTO;
  dto: RestaurantReviewDTO;
}) {
  const userAreas = await searchAreas(param.userId);
  if (!userAreas) {
    throw new CallerWrongDomainRuleException(
      ErrorSubCategoryEnum.NO_DATA,
      'can not register review, should register area',
      ErrorCodeEnum.MISSING_USER_AREA,
    );
  }

  await createReview(param);
}

export async function getReviews(param: {
  restaurantId: bigint;
  userId?: number;
  page?: number;
  limit?: number;
}) {
  return await getRestaurantReviews(
    param.restaurantId,
    param.userId,
    param.page,
    param.limit,
  );
}

export async function getReviewsByUserId(param: {
  reviewerId: number;
  userId: number;
}) {
  return await getRestaurantReviewsByUserId(param.reviewerId, param.userId);
}

export async function reactToRestaurantReview(param: {
  reviewId: number;
  restaurantId: number;
  userId: number;
  reactionType: REACTION_TYPE | null;
}) {
  await upsertRestaurantReviewRxn(param);
}

export function getFilterOptions() {
  return getSearchOptions();
}

export function getReviewFilterOptions() {
  return getReviewOptions();
}

export function getRestaurantReportOptions() {
  return getReportOptions();
}
