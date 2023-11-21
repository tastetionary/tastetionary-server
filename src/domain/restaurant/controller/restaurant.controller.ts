import {
  Controller,
  HttpCode,
  Injectable,
  UseFilters,
  UseGuards,
  Request,
  Res,
} from '@nestjs/common';
import { HttpExceptionFilter } from '@common/exception/exception.filter';
import { TypedBody, TypedRoute } from '@nestia/core';
import { BaseResponseDto } from '@common/dto/base.dto';
import { AuthGuard } from '@common/auth/auth.guard';
import {
  AggregateReviewDTO,
  ExternalRestaurantInformationDTO,
  GetRestaurantFilterOption,
  RestaurantReviewDTO,
} from '@domain/restaurant/dto/restaurant.dto';
import { RestaurantService } from '@domain/restaurant/service/restaurant.service';
import { ExternalRestaurantInformationEntity } from '@domain/restaurant/repository/restaurant.repository';
import { Response } from 'express';

export interface RegisterRestaurantReviewInput {
  /**
   * review data
   * @type RestaurantReviewDTO
   */
  review: RestaurantReviewDTO;

  /**
   * external restaurant information for register
   * @type ExternalRestaurantInformationDTO
   */
  external: ExternalRestaurantInformationDTO;
}

export interface GetRestaurantInput
  extends Omit<RestaurantReviewDTO, 'summary' | 'opinion'> {
  /**
   * already recommended restaurant ids, it will be ignored
   * example: 10000
   * @type number
   */
  excludeIds: number[];
}

export interface GetRestaurantsOutput
  extends Omit<ExternalRestaurantInformationEntity, 'id' | 'externalUUID'> {
  id: string;
  externalUUID: string;
  /**
   * aggregate data from review, if not reviewed, it will be null
   * @type AggregateReviewDTO
   */
  aggregateReviews: AggregateReviewDTO | null;
}

@Controller('v1/restaurant')
@UseFilters(new HttpExceptionFilter())
@Injectable()
export class RestaurantController {
  constructor(private service: RestaurantService) {}

  /**
   * @tag restaurant
   * @summary get restaurants by condition
   * @security bearer
   */
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @TypedRoute.Post('/recommendation')
  async getRestaurants(
    @Request() req,
    @TypedBody()
    input: GetRestaurantInput,
    @Res() res: Response,
  ): Promise<BaseResponseDto<GetRestaurantsOutput>> {
    const userId = req.user.userId;
    const maxDistanceMeter = 1_000;

    const data = await this.service.getRecommendedRestaurant({
      userId,
      maxDistanceMeter: maxDistanceMeter,
      ltePrice: input.price,
      keywords: input.keywords,
      categories: [input.category],
      excludeRestaurantIds: input.excludeIds.map((id) => BigInt(id)),
    });

    const { id, externalUUID, ...rest } = data.restaurant;
    return new BaseResponseDto({
      id: id.toString(),
      externalUUID: externalUUID.toString(),
      ...rest,
      aggregateReviews: data.aggregateReviews,
    });
  }

  /**
   * @tag restaurant
   * @summary register restaurant review only for end-user who register activity area
   * @security bearer
   */
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @TypedRoute.Post('/review')
  async registerRestaurantReview(
    @Request() req,
    @TypedBody()
    input: RegisterRestaurantReviewInput,
  ): Promise<BaseResponseDto<object>> {
    const userId = req.user.userId;
    await this.service.registerReview({
      userId,
      externalDto: input.external,
      dto: input.review,
    });
    return new BaseResponseDto({ state: 'success' });
  }

  /**
   * @tag restaurant
   * @summary get restaurant filter option
   */
  @TypedRoute.Get('option')
  @HttpCode(200)
  async getOption(): Promise<BaseResponseDto<GetRestaurantFilterOption>> {
    const res = await this.service.getRestaurantOptions();

    return new BaseResponseDto({
      categories: res.categories,
      keywords: res.keywords,
      prices: res.prices,
    });
  }
}
