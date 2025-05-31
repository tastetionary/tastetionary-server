import {
  Controller,
  HttpCode,
  Injectable,
  UseFilters,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { HttpExceptionFilter } from '@common/exception/exception.filter';
import { TypedRoute } from '@nestia/core';
import { BaseResponseDto } from '@common/dto/base.dto';
import { AuthGuard } from '@common/auth/auth.guard';
import { RolesGuard } from '@common/auth/roles.guard';
import { RequireAdmin } from '@common/auth/require-admin.decorator';
import { getReviews } from '@domain/restaurant/facade/restaurant.facade';
import { getAllUsers } from '@domain/user/service/user.service';
import { ProfileResponse } from '@domain/user/dto/user.dto';
import { UserRole } from '@domain/user/user.enum';
import { AccountCategory } from '@domain/account/account.enum';
import {
  PageRequestParams,
  PageResponseDto,
} from '@root/src/common/dto/pagination.dto';
import { RestaurantReview } from '@domain/restaurant/controller/restaurant.controller';

interface ExtendedAccount {
  identification: string;
  category: AccountCategory;
}

interface UserWithExtendedAccount extends Omit<ProfileResponse, 'account'> {
  state: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  account: ExtendedAccount | null;
}

interface AdminUserListResponse {
  users: UserWithExtendedAccount[];
  total: number;
}

@Controller('v1/admin')
@UseFilters(new HttpExceptionFilter())
@Injectable()
export class AdminController {
  /**
   * @tag admin
   * @summary 모든 회원 조회 (관리자 전용)
   * @security bearer
   */
  @UseGuards(AuthGuard, RolesGuard)
  @RequireAdmin()
  @HttpCode(200)
  @TypedRoute.Get('/users')
  async getAllUsers(): Promise<BaseResponseDto<AdminUserListResponse>> {
    const users = await getAllUsers();
    return new BaseResponseDto({
      users,
      total: users.length,
    });
  }

  /**
   * @tag admin
   * @summary 모든 식당 리뷰 조회 (관리자 전용)
   * @security bearer
   */
  @UseGuards(AuthGuard, RolesGuard)
  @RequireAdmin()
  @HttpCode(200)
  @TypedRoute.Get('/restaurant/review')
  async getAllRestaurantReviews(
    @Request() req,
    @Query() query: PageRequestParams,
  ): Promise<PageResponseDto<any>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const res = await getReviews({
      page,
      limit,
    });

    const { keywordReviews, data } = res;
    const reviews: Array<Omit<RestaurantReview, 'restaurant'>> = data.map(
      (review) => ({
        ...review,
        id: review.id.toString(),
        external_restaurant_information_id:
          review.external_restaurant_information_id.toString(),
      }),
    );

    return new PageResponseDto(
      {
        keywordReviews,
        reviews: reviews,
      },
      Number(limit),
      res.totalCount,
    );
  }
}
