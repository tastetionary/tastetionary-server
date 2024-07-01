import {
  createReview,
  getRecommendedRestaurant,
  getNearyByRestaurants,
  getSearchOptions,
  getReviewOptions,
  getRestaurantReviews,
  reportRestaurantReview,
} from '@domain/restaurant/service/restaurant.service';
import { ErrorSubCategoryEnum } from '@common/exception/enum';
import { CallerWrongDomainRuleException } from '@common/exception/internal.exception';
import { searchAreas } from '@domain/user/service/user.service';
import {
  ExternalRestaurantInformationDTO,
  RestaurantReviewDTO,
} from '@domain/restaurant/dto/restaurant.dto';
import {
  RestaurantCategory,
  ReviewReportCategory,
} from '@domain/restaurant/restaurant.enum';

export async function getRecommendations(param: {
  userId: number;
  maxDistanceMeter: number;
  keywords: string[];
  ltePrice: number;
  categories: RestaurantCategory[];
  excludeRestaurantIds: bigint[];
}) {
  const userAreas = await searchAreas(param.userId);
  if (!userAreas.diningArea) {
    throw new CallerWrongDomainRuleException(
      ErrorSubCategoryEnum.NO_DATA,
      'no dining area',
      'should register first',
    );
  }

  return getRecommendedRestaurant({ userAreas, ...param });
}

export async function getNearByRestaurants(param: {
  userId: number;
  maxDistanceMeter: number;
}) {
  const userAreas = await searchAreas(param.userId);
  if (!userAreas.diningArea) {
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
  if (!userAreas.activityArea) {
    throw new CallerWrongDomainRuleException(
      ErrorSubCategoryEnum.NO_DATA,
      'can not register review, should register activity area',
    );
  }

  await createReview(param);
}

export async function getReviews(param: { restaurantId: bigint }) {
  return await getRestaurantReviews(param.restaurantId);
}

export async function reportReview(param: {
  reviewId: number;
  userId: number;
  content: string;
  category: ReviewReportCategory;
}) {
  await reportRestaurantReview(param);
}

export function getFilterOptions() {
  return getSearchOptions();
}

export function getReviewFilterOptions() {
  return getReviewOptions();
}
