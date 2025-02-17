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
} from '@domain/restaurant/service/restaurant.service';
import { ErrorCodeEnum, ErrorSubCategoryEnum } from '@common/exception/enum';
import { CallerWrongDomainRuleException } from '@common/exception/internal.exception';
import {
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

export async function getRecommendations(param: {
  userId: number;
  maxDistanceMeter: number;
  keywords: string[];
  prices: RestaurantPrice[];
  categories: RestaurantCategory[];
  excludeRestaurantIds: bigint[];
}) {
  const userAreas = await searchAreas(param.userId);
  if (!userAreas) {
    throw new CallerWrongDomainRuleException(
      ErrorSubCategoryEnum.NO_DATA,
      'no area',
      ErrorCodeEnum.MISSING_USER_AREA,
    );
  }

  const res = await getRecommendedRestaurant({ userAreas, ...param });
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
}) {
  return await getRestaurantReviews(param.restaurantId, param.userId);
}

export async function getReviewsByUserId(param: {
  reviewerId: number;
  userId: number;
}) {
  return await getRestaurantReviewsByUserId(param.reviewerId, param.userId);
}

export async function reportReview(param: {
  reviewId: number;
  userId: number;
  content: string;
  category: ReviewReportCategory;
}) {
  await reportRestaurantReview(param);
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
