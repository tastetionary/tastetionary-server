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
  getReviewById,
  getReviewsByConditions,
  getReviewsByUserId,
  getUserReviewCount,
  RestaurantReviewRecord,
  saveExternalRestaurantInformation,
  saveReview,
  saveReviewReport,
} from '@domain/restaurant/repository/restaurant.repository';
import {
  RestaurantCategory,
  RestaurantKeywordEmoji,
  ReviewReportCategory,
} from '@domain/restaurant/restaurant.enum';
import * as fx from '@fxts/core';
import { detachEmoji, getRandomItem } from '@common/util';
import {
  CallerWrongDomainRuleException,
  CallerWrongUsageException,
  EmptyContentException,
  InternalDomainException,
} from '@common/exception/internal.exception';
import { ErrorSubCategoryEnum } from '@common/exception/enum';
import {
  AreaEntity,
  searchAreas,
  searchProfile,
} from '@domain/user/service/user.service';
import { sendDiscordMessage } from '@thirdParty/discord/discord';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { ConfigService } from '@nestjs/config';

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

  data.keywords = attachEmoji(data.keywords);
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
  if (!param.userAreas.diningArea) return [];

  return await getExternalRestaurantIdsByDistance({
    latitude: param.userAreas.diningArea?.latitude,
    longitude: param.userAreas.diningArea?.longitude,
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
      ErrorSubCategoryEnum.NO_DATA,
      'can not register review, should register activity area',
    );
  }

  const externalInfo = await registerExternalRestaurantInformationWhenNoData(
    param.externalDto,
  );

  if (!externalInfo) {
    throw new InternalDomainException(
      ErrorSubCategoryEnum.NO_DATA,
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

export async function getRestaurantReviews(restaurantId: bigint) {
  const reviews = await getReviewsByConditions({
    restaurantIds: [restaurantId],
  });

  const keywordsWithEmojis = reviews.flatMap((review) =>
    attachEmoji(review.keywords),
  );
  const keywordCounts = keywordsWithEmojis.reduce(
    (counts, keyword) => ({
      ...counts,
      [keyword]: (counts[keyword] || 0) + 1,
    }),
    {},
  );

  const opinions = reviews.map((r) => r.opinion);
  const filteredOpinions = opinions.filter(
    (opinion) => opinion !== null,
  ) as string[];
  const revisitRatio = calcRevisitRatio(filteredOpinions);

  const data = await Promise.all(
    reviews.map(async (review) => {
      const profile = await searchProfile(review.userId);
      const count = await getUserReviewCount(review.userId);
      return {
        user: {
          id: profile.user.id,
          nickname: profile.user.nickname,
          reviews: count,
        },
        ...review,
        keywords: attachEmoji(review.keywords),
      };
    }),
  );

  return {
    keywordReviews: {
      keywordCounts,
      revisitRatio,
    },
    data,
  };
}

export function getSearchOptions() {
  return getRestaurantOptionsRecord();
}

export function getReviewOptions() {
  const options = getRestaurantOptionsRecord();
  return {
    categories: options.categories.filter(
      (c) => c.name != RestaurantCategory.ALL,
    ),
    keywords: options.keywords,
    prices: options.prices,
  };
}

export async function reportRestaurantReview(param: {
  reviewId: number;
  userId: number;
  content: string;
  category: ReviewReportCategory;
}) {
  const review = await getReviewById(param.reviewId);
  if (!review) {
    throw new CallerWrongUsageException(
      ErrorSubCategoryEnum.NO_DATA,
      `no review data ${param.reviewId}`,
    );
  }

  const discordConfig = new ConfigurationService(
    new ConfigService(),
  ).getDiscordConfig();
  const discordContent = getDiscordContentsForm(
    {
      ...review,
      category: review.category as RestaurantCategory,
    },
    param.userId,
    param.category,
  );
  await sendDiscordMessage(discordContent, discordConfig);
  await saveReviewReport(param);
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

function attachEmoji(data: string[]) {
  return data.map((d) => d + RestaurantKeywordEmoji[d]);
}

function getDiscordContentsForm(
  review: RestaurantReviewRecord,
  userId: number,
  category: ReviewReportCategory,
) {
  const contents = {
    title: '식당 리뷰 신고',
    description: `유저 아이디: ${userId} \n 신고 카테고리: ${category} \n 리뷰 아이디: ${review.id} \n 리뷰 내용: ${review.summary} \n 리뷰 카테고리: ${review.category} \n 리뷰 키워드: ${review.keywords} \n 리뷰 가격: ${review.price} \n 리뷰 의견: ${review.opinion} \n 리뷰 생성일: ${review.createdAt}`,
  };

  return contents;
}

export const _private = {
  registerExternalRestaurantInformationWhenNoData,
  aggregatePrice,
  getDiscordContentsForm,
};
