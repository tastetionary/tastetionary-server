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
import { AuthGuard } from '@common/auth/auth.guard';
import { FoodService } from '@domain/food/service/food.service';
import { FoodOption, GetFoodOutput } from '@domain/food/dto/food.dto';

@Controller('v1/food')
@UseFilters(new HttpExceptionFilter())
@Injectable()
export class FoodController {
  constructor(private service: FoodService) {}

  /**
   * @tag food
   * @summary get food recommentation
   * @security bearer
   */
  @UseGuards(AuthGuard)
  @TypedRoute.Post('/recommend')
  @HttpCode(200)
  async getRecommendedFood(
    @TypedBody() dto: FoodOption,
  ): Promise<BaseResponseDto<GetFoodOutput | null>> {
    const res = await this.service.getRecommendedFood({
      keywords: dto.keywords,
      categories: dto.categories,
    });

    return new BaseResponseDto({
      name: res.name,
    });
  }

  /**
   * @tag food
   * @summary get food recommentation
   */
  @TypedRoute.Get('options')
  @HttpCode(200)
  async getFoodOptions(): Promise<BaseResponseDto<FoodOption>> {
    const res = await this.service.getFoodOptions();

    return new BaseResponseDto({
      categories: res.categories,
      keywords: res.keywords,
    });
  }
}
