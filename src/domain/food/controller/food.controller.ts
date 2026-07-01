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
import {
  FoodOption,
  GetFoodFilterOption,
  GetFoodOutput,
} from '@domain/food/dto/food.dto';
import {
  getRecommendations,
  getFilterOptions,
  getRecentRecommendations,
} from '@domain/food/facade/food.facade';
import { RateLimit, RateLimitGuard } from '@common/rate-limit/rate-limit.guard';

@Controller('v1/food')
@UseFilters(new HttpExceptionFilter())
@Injectable()
export class FoodController {
  /**
   * @tag food
   * @summary get food recommentation
   */
  @UseGuards(RateLimitGuard)
  @RateLimit({ ttl: 60, limit: 30 })
  @TypedRoute.Post('/recommendation')
  @HttpCode(200)
  async getRecommentation(
    @TypedBody() dto: FoodOption,
  ): Promise<BaseResponseDto<GetFoodOutput>> {
    const res = await getRecommendations({
      keywords: dto.keywords,
      categories: dto.categories,
    });

    return new BaseResponseDto({
      id: res.id,
      name: res.name,
    });
  }

  /**
   * @tag food
   * @summary get food filter option
   */
  @TypedRoute.Get('option')
  @HttpCode(200)
  getOption(): BaseResponseDto<GetFoodFilterOption> {
    const res = getFilterOptions();

    return new BaseResponseDto({
      categories: res.categories,
      keywords: res.keywords,
    });
  }

  /**
   * @tag food
   * @summary get recent selected food
   */
  @HttpCode(200)
  @TypedRoute.Get('/recent')
  async getRecentFood(): Promise<BaseResponseDto<Array<GetFoodOutput>>> {
    const result = await getRecentRecommendations();

    return new BaseResponseDto(result);
  }
}
