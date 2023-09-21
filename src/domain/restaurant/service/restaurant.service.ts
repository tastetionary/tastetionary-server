import { Injectable } from '@nestjs/common';
import { RestaurantReviewDTO } from '@domain/restaurant/dto/restaurant.dto';
import { RestaurantRepository } from '@domain/restaurant/repository/restaurant.repository';

@Injectable()
export class RestaurantService {
  constructor(private repo: RestaurantRepository) {}

  async registerReview(param: {
    userId: number;
    externalRestaurantInformationId: number;
    dto: RestaurantReviewDTO;
  }) {
    await this.repo.saveReview({
      userId: param.userId,
      externalRestaurantInformationId: param.externalRestaurantInformationId,
      ...param.dto,
    });
  }

  async getReviews(userId: number) {
    return this.repo.getReviewsByUserId(userId);
  }
}
