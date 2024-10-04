import {
  Controller,
  HttpCode,
  Injectable,
  UseGuards,
  UseFilters,
} from '@nestjs/common';
import { HttpExceptionFilter } from '@common/exception/exception.filter';
import { TypedBody, TypedRoute } from '@nestia/core';
import { BaseResponseDto } from '@common/dto/base.dto';
import { FoodService } from '@domain/food/service/food.service';
import {
  FoodOption,
  GetFoodFilterOption,
  GetFoodOutput,
} from '@domain/food/dto/food.dto';

@Controller('v1/food')
@UseFilters(new HttpExceptionFilter())
@Injectable()
export class FoodController {
  constructor(private service: FoodService) {}

  /**
   * @tag food
   * @summary get food recommentation
   */
  @TypedRoute.Post('/recommendation')
  @HttpCode(200)
  async getRecommentation(
    @TypedBody() dto: FoodOption,
  ): Promise<BaseResponseDto<GetFoodOutput | null>> {
    const res = await this.service.getRecommendedFood({
      keywords: dto.keywords,
      categories: dto.categories,
    });

    if (res === null) {
      return new BaseResponseDto(null);
    }

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
  async getOption(): Promise<BaseResponseDto<GetFoodFilterOption>> {
    const res = await this.service.getFoodOptions();

    return new BaseResponseDto({
      categories: res.categories,
      keywords: res.keywords,
    });
  }
}
