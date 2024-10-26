import {
  createReview,
  getRecommendedRestaurant,
  getNearyByRestaurants,
  getSearchOptions,
  getReviewOptions,
  getRestaurantReviews,
  reportRestaurantReview,
  upsertRestaurantReviewRxn,
} from '@domain/restaurant/service/restaurant.service';
import { ErrorSubCategoryEnum } from '@common/exception/enum';
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
  ReviewReportCategory,
} from '@domain/restaurant/restaurant.enum';
import { REACTION_TYPE } from '@prisma/client';
import { PreferenceCategory } from '@domain/user/user.enum';

export async function getRecommendations(param: {
  userId: number;
  maxDistanceMeter: number;
  keywords: string[];
  ltePrice: number;
  categories: RestaurantCategory[];
  excludeRestaurantIds: bigint[];
}) {
  const userAreas = await searchAreas(param.userId);
  if (!userAreas) {
    throw new CallerWrongDomainRuleException(
      ErrorSubCategoryEnum.NO_DATA,
      'no dining area',
      'should register first',
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

  return {
    ...res,
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
      'no dining area',
      'should register first',
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
      'can not register review, should register activity area',
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
