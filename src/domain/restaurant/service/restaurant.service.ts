import { Inject, Injectable } from '@nestjs/common';
import {
  ExternalRestaurantInformationDTO,
  RestaurantReviewDTO,
} from '@domain/restaurant/dto/restaurant.dto';
import {
  RestaurantRepository,
  RestaurantReviewEntity,
} from '@domain/restaurant/repository/restaurant.repository';
import { ServiceException } from '@common/exception/custom.exception';
import { UserService } from '@domain/user/service/user.service';
import { EndUser } from '@domain/user/core/end-user';
import { RestaurantCategory } from '@domain/restaurant/restaurant.enum';

@Injectable()
export class RestaurantService {
  constructor(private repo: RestaurantRepository) {}

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
      throw new ServiceException(
        'domain rule error',
        `user: ${param.userId} has no area, should register area first`,
      );
    }

    const externalInfo =
      await this.registerExternalRestaurantInformationWhenNoData(
        param.externalDto,
      );

    if (!externalInfo) {
      throw new ServiceException(
        'internal exception occur',
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
    await this.repo.saveReview({
      userId: param.userId,
      externalRestaurantInformationId: param.externalInfoId,
      ...param.dto,
    });
  }

  async getReviews(userId: number) {
    return this.repo.getReviewsByUserId(userId);
  }

  async registerExternalRestaurantInformationWhenNoData(
    param: ExternalRestaurantInformationDTO,
  ) {
    const info = await this.getExternalRestaurant(param.externalUUID);
    if (info) {
      return info;
    }

    await this.repo.saveExternalRestaurantInformation({
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
    return await this.repo.getExternalRestaurantInformation(
      BigInt(externalUUID),
    );
  }

  async getRecommendedRestaurant(
    param: {
      userId: number;
      maxDistance: number;
      keywords: string[];
      ltePrice: number;
      categories: RestaurantCategory[];
    },
    user?: EndUser,
  ) {
    const endUser = user ?? (await this.userService.getEndUser(param.userId));
    if (!endUser.dinningArea) {
      throw new ServiceException('no dinning area, should register first');
    }

    const restaurants = await this.repo.getExternalRestaurantIdsByDistance({
      latitude: endUser.dinningArea.latitude,
      longitude: endUser.dinningArea.longitude,
      maxDistanceOnMeter: param.maxDistance,
    });

    if (restaurants.length == 0) {
      return [];
    }

    const ids = restaurants.map((r) => r.id);
    const properRestaurants = await this.repo.getRestaurantsByConditions({
      restaurantIds: ids,
      keywords: param.keywords,
      ltePrice: param.ltePrice,
      categories: param.categories,
    });

    if (properRestaurants.length == 0) {
      return [];
    }

    return properRestaurants;
  }

  aggregateRestaurant(reviews: RestaurantReviewEntity[]) {
    return {
      reviews,
      avgPrice: 0,
    };
  }
}
