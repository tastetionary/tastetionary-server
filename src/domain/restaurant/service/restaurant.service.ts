import { Inject, Injectable } from '@nestjs/common';
import {
  AggregateReviewDTO,
  ExternalRestaurantInformationDTO,
  RestaurantReviewDTO,
} from '@domain/restaurant/dto/restaurant.dto';
import {
  getExternalRestaurantIdsByDistance,
  getExternalRestaurantInformation,
  getRestaurantOptionsRecord,
  getReviewsByConditions,
  getReviewsByUserId,
  RestaurantReviewRecord,
  saveExternalRestaurantInformation,
  saveReview,
} from '@domain/restaurant/repository/restaurant.repository';
import { UserService } from '@domain/user/service/user.service';
import { EndUser } from '@domain/user/core/end-user';
import { RestaurantCategory } from '@domain/restaurant/restaurant.enum';
import * as fx from '@fxts/core';
import { detachEmoji, getRandomItem } from '@common/util';
import {
  CallerWrongDomainRuleException,
  InternalDomainException,
} from '@common/exception/internal.exception';
import { ErrorNameEnum } from '@common/exception/enum';

@Injectable()
export class RestaurantService {
  constructor() {}

  @Inject(UserService)
  private readonly userService: UserService;

  async registerReview(
    param: {
      userId: number;
      externalDto: ExternalRestaurantInformationDTO;
      dto: RestaurantReviewDTO;
    },
    user?: EndUser,
  ) {
    const endUser = user ?? (await this.userService.getEndUser(param.userId));

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
      masDistanceMeter: number;
      keywords: string[];
      ltePrice: number;
      categories: RestaurantCategory[];
      excludeRestaurantIds: bigint[];
    },
    user?: EndUser,
  ) {
    const endUser = user ?? (await this.userService.getEndUser(param.userId));
    if (!endUser.dinningArea) {
      throw new CallerWrongDomainRuleException(
        ErrorNameEnum.NO_DATA,
        'no dinning area',
        'should register first',
      );
    }

    const restaurants = await getExternalRestaurantIdsByDistance({
      latitude: endUser.dinningArea.latitude,
      longitude: endUser.dinningArea.longitude,
      maxDistanceMeter: param.masDistanceMeter,
      excludedIds: param.excludeRestaurantIds,
    });

    if (restaurants.length == 0) {
      return { restaurant: null, aggregateReviews: null };
    }

    const ids = restaurants.map((r) => r.id);
    const targetReviews = await getReviewsByConditions({
      restaurantIds: ids,
      keywords: detachEmoji(param.keywords),
      ltePrice: param.ltePrice,
      categories: param.categories,
    });

    if (targetReviews.length == 0) {
      const randomRestaurant = getRandomItem(restaurants);
      return { restaurant: randomRestaurant, aggregateReviews: null };
    }

    const { id, data } = this.aggregateRestaurantReview(targetReviews);
    const targetRestaurant = restaurants.find((r) => r.id.toString() == id);

    return {
      restaurant: targetRestaurant,
      aggregateReviews: data,
    };
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
      if (data[price.toString()]) {
        data[price.toString()] += 1;
      } else {
        data[price.toString()] = 1;
      }
    });
    const uniquePrices = [...new Set(prices)];
    data['avg'] = fx.average(uniquePrices);
    return data;
  }

  async getRestaurantOptions() {
    return await getRestaurantOptionsRecord();
  }
}
