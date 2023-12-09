import { Injectable } from '@nestjs/common';
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
import { getUser, userEntity } from '@domain/user/service/user.service';

interface GetRecommendedRestaurant {
  restaurant: ExternalRestaurantInformationRecord;
  aggregateReviews: AggregateReviewDTO;
}

@Injectable()
export class RestaurantService {
  constructor() {}

  async registerReview(
    param: {
      userId: number;
      externalDto: ExternalRestaurantInformationDTO;
      dto: RestaurantReviewDTO;
    },
    user?: userEntity,
  ) {
    const endUser = user ?? (await getUser(param.userId));

    if (!endUser.activityArea) {
      throw new CallerWrongDomainRuleException(
        ErrorNameEnum.INVALID_INPUT,
        `user: ${param.userId} has no area, should register area first`,
      );
    }

    const externalInfo =
      await this.registerExternalRestaurantInformationWhenNoData(
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
    await this.registerRestaurantReview({
      userId: param.userId,
      externalInfoId: externalInfo.id,
      dto: param.dto,
    });
  }

  private async registerRestaurantReview(param: {
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

  async getReviews(userId: number) {
    return getReviewsByUserId(userId);
  }

  async registerExternalRestaurantInformationWhenNoData(
    param: ExternalRestaurantInformationDTO,
  ) {
    const info = await this.getExternalRestaurant(param.externalUUID);
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

    return await this.getExternalRestaurant(param.externalUUID);
  }

  async getExternalRestaurant(externalUUID: number) {
    return await getExternalRestaurantInformation(BigInt(externalUUID));
  }

  async getRecommendedRestaurant(
    param: {
      userId: number;
      maxDistanceMeter: number;
      keywords: string[];
      ltePrice: number;
      categories: RestaurantCategory[];
      excludeRestaurantIds: bigint[];
    },
    user?: userEntity,
  ): Promise<GetRecommendedRestaurant> {
    const endUser = user ?? (await getUser(param.userId));
    if (!endUser.dinningArea) {
      throw new CallerWrongDomainRuleException(
        ErrorNameEnum.NO_DATA,
        'no dinning area',
        'should register first',
      );
    }

    const restaurants = await this.getRestaurantsByDistance(endUser, param);
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

    const { id, data } = this.aggregateRestaurantReview(targetReviews);
    const targetRestaurant = restaurants.find(
      (r) => r.id.toString() == id,
    ) as ExternalRestaurantInformationRecord;

    return {
      restaurant: targetRestaurant,
      aggregateReviews: data,
    };
  }

  private async getRestaurantsByDistance(
    user: userEntity,
    param: {
      userId: number;
      maxDistanceMeter: number;
      keywords: string[];
      ltePrice: number;
      categories: RestaurantCategory[];
      excludeRestaurantIds: bigint[];
    },
  ) {
    if (!user.dinningArea) return [];

    return await getExternalRestaurantIdsByDistance({
      latitude: user.dinningArea?.latitude,
      longitude: user.dinningArea?.longitude,
      maxDistanceMeter: param.maxDistanceMeter,
      excludedIds: param.excludeRestaurantIds,
    });
  }

  aggregateRestaurantReview(reviews: RestaurantReviewRecord[]) {
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
        data['aggregatePrice'] = this.aggregatePrice(data.prices);
        data['revisitRatio'] = this.calcRevisitRatio(data.opinions);
        data.keywords = [...new Set(data.keywords)];
        return data;
      }),
      fx.toArray,
    );
    return { id: randomId, data };
  }

  calcRevisitRatio(opinions: string[], standard = 'Y') {
    const standardCount = opinions.filter((op) => op === standard).length;
    return parseFloat(((standardCount / opinions.length) * 100).toFixed(1));
  }

  aggregatePrice(prices: number[]) {
    const data: { [index: string]: number } = {};

    prices.forEach((price) => {
      data[price.toString()] = (data[price.toString()] || 0) + 1;
    });

    const uniquePrices = [...new Set(prices)];
    data['avg'] = fx.average(uniquePrices);
    return data;
  }

  async getRestaurantOptions() {
    return await getRestaurantOptionsRecord();
  }
}
