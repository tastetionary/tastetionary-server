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
import {
  getExternalRestaurantIdsByDistance,
  getReviewsByConditions,
  getExternalRestaurantInformationById,
  getUserReviewCount,
} from '@domain/restaurant/repository/restaurant.repository';
import { ErrorCodeEnum, ErrorSubCategoryEnum } from '@common/exception/enum';
import { CallerWrongDomainRuleException } from '@common/exception/internal.exception';
import {
  getPreferenceRestaurant,
  isRestaurantInUserPreferences,
  searchAreas,
  searchProfile,
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
import {
  redisGet,
  redisSet,
  redisExpire,
} from '@common/redis/redis.operations';

interface Recommendation {
  id: string;
  expiredAt: number;
}

export async function getRecommendations(param: {
  userId: number;
  maxDistanceMeter: number;
  keywords: string[];
  prices: RestaurantPrice[];
  categories: RestaurantCategory[];
}) {
  const userAreas = await searchAreas(param.userId);
  if (!userAreas) {
    throw new CallerWrongDomainRuleException(
      ErrorSubCategoryEnum.NO_DATA,
      'no area',
      ErrorCodeEnum.MISSING_USER_AREA,
    );
  }

  const redisKey = `user:${param.userId}:recommendations`;
  const recentRecommendations = await getRecentRecommendations(redisKey);
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

  await saveNewRecommendation(redisKey, res.restaurant.id.toString());
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
  redisKey: string,
): Promise<Recommendation[]> {
  const recommendations = await redisGet(redisKey);
  if (!recommendations) return [];

  const parsedRecommendations = JSON.parse(recommendations) as Recommendation[];
  const now = Date.now();

  const validRecommendations = parsedRecommendations.filter(
    (rec) => rec.expiredAt > now,
  );

  if (validRecommendations.length !== parsedRecommendations.length) {
    await redisSet(redisKey, JSON.stringify(validRecommendations));
    await redisExpire(redisKey, 5 * 60);
  }

  return validRecommendations;
}

async function saveNewRecommendation(
  redisKey: string,
  restaurantId: string,
): Promise<void> {
  const recommendations = await redisGet(redisKey);
  const newRecommendation: Recommendation = {
    id: restaurantId,
    expiredAt: Date.now() + 5 * 60 * 1000,
  };

  const updatedRecommendations = recommendations
    ? [...JSON.parse(recommendations), newRecommendation]
    : [newRecommendation];

  await redisSet(redisKey, JSON.stringify(updatedRecommendations));
  await redisExpire(redisKey, 5 * 60);
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
  restaurantId?: bigint;
  userId?: number;
  page?: number;
  limit?: number;
  restaurantName?: string;
  createdAt?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}) {
  const result = await getRestaurantReviews(
    param.restaurantId,
    param.userId,
    param.page,
    param.limit,
  );

  return result;
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

export async function getFilteredReviews(param: {
  page?: number;
  limit?: number;
  restaurantName?: string;
  createdAt?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}) {
  const allReviews = await getReviewsByConditions({});
  let nearbyRestaurants: any[] = [];

  const filteredData = await (async () => {
    let data = allReviews;

    if (param.createdAt) {
      const targetDate = new Date(param.createdAt);
      const targetDateStr = targetDate.toISOString().split('T')[0];

      data = data.filter((review) => {
        const reviewDateStr = review.createdAt?.toISOString().split('T')[0];
        return reviewDateStr === targetDateStr;
      });
    }

    if (param.latitude && param.longitude) {
      const radius = param.radius ?? 1000;
      nearbyRestaurants = await getExternalRestaurantIdsByDistance({
        latitude: param.latitude,
        longitude: param.longitude,
        maxDistanceMeter: radius,
      });

      const nearbyRestaurantIds = nearbyRestaurants.map(
        (restaurant) => restaurant.id,
      );
      data = data.filter((review) =>
        nearbyRestaurantIds.includes(review.external_restaurant_information_id),
      );
    }

    return data;
  })();

  const totalCount = filteredData.length;

  const page = param.page ?? 1;
  const limit = param.limit ?? 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  const restaurantDistanceMap = new Map();
  if (param.latitude && param.longitude) {
    nearbyRestaurants.forEach((restaurant) => {
      restaurantDistanceMap.set(restaurant.id, restaurant.distance / 1000); // 미터를 km로 변환
    });
  }

  const detailedReviews = await Promise.all(
    paginatedData.map(async (review) => {
      const { reactions = [], ...record } = review;
      const userProfile = await searchProfile(review.userId);
      const restaurant = await getExternalRestaurantInformationById(
        Number(review.external_restaurant_information_id),
      );
      const distance =
        restaurantDistanceMap.get(review.external_restaurant_information_id) ||
        0;
      const userReviewCount = await getUserReviewCount(review.userId);

      return {
        ...record,
        restaurant: restaurant
          ? {
              name: restaurant.name,
              address: restaurant.address || '',
              phone: restaurant.phone,
              distance: Math.round(distance * 100) / 100,
            }
          : null,
        user: {
          id: review.userId,
          identification: userProfile.account.identification,
          createdAt: userProfile.account.createdAt,
          nickname: userProfile.user.nickname,
          reviews: userReviewCount,
        },
        keywords: review.keywords,
        userReaction: null,
      };
    }),
  );

  return {
    data: detailedReviews,
    totalCount: totalCount,
  };
}
