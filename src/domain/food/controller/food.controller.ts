import { Controller, HttpCode, Injectable, UseFilters } from '@nestjs/common';
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
} from '@domain/food/facade/food.facade';

@Controller('v1/food')
@UseFilters(new HttpExceptionFilter())
@Injectable()
export class FoodController {
  /**
   * @tag food
   * @summary get food recommentation
   */
  @TypedRoute.Post('/recommendation')
  @HttpCode(200)
  getRecommentation(
    @TypedBody() dto: FoodOption,
  ): BaseResponseDto<GetFoodOutput> {
    const res = getRecommendations({
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
}
