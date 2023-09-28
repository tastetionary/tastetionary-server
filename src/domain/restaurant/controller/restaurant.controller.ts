import {
  Controller,
  HttpCode,
  Injectable,
  UseFilters,
  UseGuards,
  Request,
} from '@nestjs/common';
import { HttpExceptionFilter } from '@common/exception/exception.filter';
import { TypedBody, TypedRoute } from '@nestia/core';
import { BaseResponseDto } from '@common/dto/base.dto';
import { AuthGuard } from '@common/auth/auth.guard';
import {
  ExternalRestaurantInformationDTO,
  RestaurantReviewDTO,
} from '@domain/restaurant/dto/restaurant.dto';
import { RestaurantService } from '@domain/restaurant/service/restaurant.service';

export interface RegisterRestaurantReviewInput {
  review: RestaurantReviewDTO;
  external: ExternalRestaurantInformationDTO;
}

export interface GetRestaurantInput
  extends Omit<RestaurantReviewDTO, 'summary'> {
  /**
   * already recommended restaurant ids, it will be ignored
   * example: 10000
   * @type number
   */
  excludeIds: number[];
}

export interface GetRestaurantsOutput extends ExternalRestaurantInformationDTO {
  /**
   * price per person,
   * example: 10000
   * @type number
   */
  pricePerPerson: number;

  /**
   * rejoin count / total review count, 0 ~ 100
   * example: 80,
   * @type string
   */
  ratioOfRejoin: number;

  /**
   * total count by condition
   * example: 998
   * @type number
   */
  resultCount: number;
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
  ): Promise<BaseResponseDto<GetRestaurantsOutput[]>> {
    const userId = req.user.userId;
    console.log(input, userId);
    return new BaseResponseDto([
      {
        name: '놀부 부대찌개',
        externalUUID: 1112233,
        latitude: 37.1231232,
        longitude: 127.1231223,
        referenceLink: 'https://naver.com',
        pricePerPerson: 12_000,
        ratioOfRejoin: 20,
        resultCount: 1,
      },
    ]);
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
}
