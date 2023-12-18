import {
  AggregateReviewDTO,
  ExternalRestaurantInformationDTO,
  RestaurantReviewDTO,
} from '@domain/restaurant/dto/restaurant.dto';
import {
  ExternalRestaurantInformationRecord,
  getExternalRestaurantIdsByDistance,
  getExternalRestaurantInformation,
  getRestaurantOptionsRecord,
  getReviewsByConditions,
  getReviewsByUserId,
  RestaurantReviewRecord,
  saveExternalRestaurantInformation,
  saveReview,
} from '@domain/restaurant/repository/restaurant.repository';
import { RestaurantCategory } from '@domain/restaurant/restaurant.enum';
import * as fx from '@fxts/core';
import { detachEmoji, getRandomItem } from '@common/util';
import {
  CallerWrongDomainRuleException,
  EmptyContentException,
  InternalDomainException,
} from '@common/exception/internal.exception';
import { ErrorNameEnum } from '@common/exception/enum';
import { AreaEntity, searchAreas } from '@domain/user/service/user.service';

export function aggregateRestaurantReview(reviews: RestaurantReviewRecord[]) {
  const groupedReview = fx.groupBy(
    (r) => r.external_restaurant_information_id.toString(),
    reviews,
  );
  const randomId = getRandomItem(Object.keys(groupedReview));
  const randomReviews = groupedReview[randomId];
  const data: AggregateReviewDTO = {
    categories: [],
    summaries: [],
    opinions: [],
    keywords: [],
    prices: [],
    aggregatePrice: {},
    revisitRatio: 0,
    totalCount: randomReviews.length,
  };
  fx.pipe(
    randomReviews,
    fx.map((review) => {
      data.categories.push(review.category);
      data.summaries.push(review.summary);
      data.opinions.push(review.opinion ?? '');
      data.keywords.push(...review.keywords);
      data.prices.push(review.price);
      return data;
    }),
    fx.map((data) => {
      data['aggregatePrice'] = aggregatePrice(data.prices);
      data['revisitRatio'] = calcRevisitRatio(data.opinions);
      data.keywords = [...new Set(data.keywords)];
      return data;
    }),
    fx.toArray,
  );
  return { id: randomId, data };
}

export async function getRecommendedRestaurant(param: {
  userAreas: AreaEntity;
  maxDistanceMeter: number;
  keywords: string[];
  ltePrice: number;
  categories: RestaurantCategory[];
  excludeRestaurantIds: bigint[];
}) {
  const restaurants = await getRestaurantsByDistance({
    ...param,
  });
  if (restaurants.length == 0) {
    throw new EmptyContentException('식사 지역 내 식당이 존재하지 않음');
  }

  const ids = restaurants.map((r) => r.id);
  const targetReviews = await getReviewsByConditions({
    restaurantIds: ids,
    keywords: detachEmoji(param.keywords),
    ltePrice: param.ltePrice,
    categories: param.categories,
  });
  if (targetReviews.length == 0) {
    throw new EmptyContentException(
      '검색 조건에 부합 되는 식당이 존재 하지 않음',
    );
  }

  const { id, data } = aggregateRestaurantReview(targetReviews);
  const targetRestaurant = restaurants.find(
    (r) => r.id.toString() == id,
  ) as ExternalRestaurantInformationRecord;

  return {
    restaurant: targetRestaurant,
    aggregateReviews: data,
  };
}

async function getRestaurantsByDistance(param: {
  userAreas: AreaEntity;
  maxDistanceMeter: number;
  excludeRestaurantIds: bigint[];
}) {
  if (!param.userAreas.dinningArea) return [];

  return await getExternalRestaurantIdsByDistance({
    latitude: param.userAreas.dinningArea?.latitude,
    longitude: param.userAreas.dinningArea?.longitude,
    maxDistanceMeter: param.maxDistanceMeter,
    excludedIds: param.excludeRestaurantIds,
  });
}

export async function createReview(param: {
  userId: number;
  externalDto: ExternalRestaurantInformationDTO;
  dto: RestaurantReviewDTO;
}) {
  const userAreas = await searchAreas(param.userId);
  if (!userAreas.activityArea) {
    throw new CallerWrongDomainRuleException(
      ErrorNameEnum.NO_DATA,
      'can not register review, should register activity area',
    );
  }

  const externalInfo = await registerExternalRestaurantInformationWhenNoData(
    param.externalDto,
  );

  if (!externalInfo) {
    throw new InternalDomainException(
      ErrorNameEnum.NO_DATA,
      `no data or can not register about uuid: ${param.externalDto.externalUUID}`,
    );
  }

  const keywords = detachEmoji(param.dto.keywords);
  param.dto.keywords = keywords;
  await createRestaurantReview({
    userId: param.userId,
    externalInfoId: externalInfo.id,
    dto: param.dto,
  });
}

async function createRestaurantReview(param: {
  userId: number;
  externalInfoId: bigint;
  dto: RestaurantReviewDTO;
}) {
  await saveReview({
    userId: param.userId,
    externalRestaurantInformationId: param.externalInfoId,
    ...param.dto,
  });
}

async function registerExternalRestaurantInformationWhenNoData(
  param: ExternalRestaurantInformationDTO,
) {
  const info = await getExternalRestaurantInformation(
    BigInt(param.externalUUID),
  );

  if (info) {
    return info;
  }

  await saveExternalRestaurantInformation({
    externalUUID: BigInt(param.externalUUID),
    name: param.name,
    location: {
      latitude: param.latitude,
      longitude: param.longitude,
    },
    referenceLink: param.referenceLink,
  });

  return await getExternalRestaurantInformation(BigInt(param.externalUUID));
}
export async function findExternalRestaurant(uuid: number) {
  return getExternalRestaurantInformation(BigInt(uuid));
}

export async function getReviews(userId: number) {
  return getReviewsByUserId(userId);
}

export function getSearchOptions() {
  return getRestaurantOptionsRecord();
}

function calcRevisitRatio(opinions: string[], standard = 'Y') {
  const standardCount = opinions.filter((op) => op === standard).length;
  return parseFloat(((standardCount / opinions.length) * 100).toFixed(1));
}
function aggregatePrice(prices: number[]) {
  const data: { [index: string]: number } = {};

  prices.forEach((price) => {
    data[price.toString()] = (data[price.toString()] || 0) + 1;
  });

  const uniquePrices = [...new Set(prices)];
  data['avg'] = fx.average(uniquePrices);
  return data;
}

export const _private = {
  registerExternalRestaurantInformationWhenNoData,
  aggregatePrice,
};
