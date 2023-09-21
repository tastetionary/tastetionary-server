import {
  Controller,
  HttpCode,
  Injectable,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { HttpExceptionFilter } from '@common/exception/exception.filter';
import { TypedBody, TypedRoute } from '@nestia/core';
import { BaseResponseDto } from '@common/dto/base.dto';
import { AuthGuard } from '@common/auth/auth.guard';
import { RestaurantReviewDTO } from '@domain/restaurant/dto/restaurant.dto';

@Controller('v1/restaurant/review')
@UseFilters(new HttpExceptionFilter())
@Injectable()
export class RestaurantController {
  constructor() {}

  @UseGuards(AuthGuard)
  @HttpCode(200)
  @TypedRoute.Post('/')
  async registerRestaurantReview(
    @TypedBody() dto: RestaurantReviewDTO,
  ): Promise<BaseResponseDto<object>> {
    console.log(dto);
    return new BaseResponseDto({ state: 'success' });
  }
}
