import { Injectable } from '@nestjs/common';
import {
  ExternalRestaurantInformationDTO,
  RestaurantReviewDTO,
} from '@domain/restaurant/dto/restaurant.dto';
import { RestaurantRepository } from '@domain/restaurant/repository/restaurant.repository';
import { ServiceException } from '@common/exception/custom.exception';

@Injectable()
export class RestaurantService {
  constructor(private repo: RestaurantRepository) {}

  async registerReview(param: {
    userId: number;
    externalDto: ExternalRestaurantInformationDTO;
    dto: RestaurantReviewDTO;
  }) {
    const externalInfo =
      await this.registerExternalRestaurantInformationWhenNoData(
        param.externalDto,
      );

    if (!externalInfo) {
      throw new ServiceException(
        'external restaurant information is not found',
        `${param.externalDto.externalUUID}}`,
      );
    }

    await this.repo.saveReview({
      userId: param.userId,
      externalRestaurantInformationId: externalInfo.id,
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
      externalUUID: param.externalUUID,
      name: param.name,
      location: {
        latitude: param.latitude,
        longitude: param.longitude,
      },
      referenceLink: param.referenceLink,
    });

    return await this.getExternalRestaurant(param.externalUUID);
  }

  async getExternalRestaurant(externalUUID: bigint) {
    return await this.repo.getExternalRestaurantInformation(externalUUID);
  }
}
