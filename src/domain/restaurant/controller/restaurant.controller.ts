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

@Controller('v1/restaurant/review')
@UseFilters(new HttpExceptionFilter())
@Injectable()
export class RestaurantController {
  constructor(private service: RestaurantService) {}

  @UseGuards(AuthGuard)
  @HttpCode(200)
  @TypedRoute.Post('/')
  async registerRestaurantReview(
    @Request() req,
    @TypedBody()
    dto: {
      review: RestaurantReviewDTO;
      external: ExternalRestaurantInformationDTO;
    },
  ): Promise<BaseResponseDto<object>> {
    const userId = req.user.userId;
    await this.service.registerReview({
      userId,
      externalDto: dto.external,
      dto: dto.review,
    });
    return new BaseResponseDto({ state: 'success' });
  }
}
