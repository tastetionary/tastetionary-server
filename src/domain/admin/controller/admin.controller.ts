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
import { TypedBody, TypedRoute } from '@nestia/core';
import { BaseResponseDto } from '@common/dto/base.dto';
import { AuthGuard } from '@common/auth/auth.guard';
import { RolesGuard } from '@common/auth/roles.guard';
import { RequireAdmin } from '@common/auth/require-admin.decorator';
import { getReviews } from '@domain/restaurant/facade/restaurant.facade';
import { getAllUsers } from '@domain/user/service/user.service';
import { ProfileResponse } from '@domain/user/dto/user.dto';
import { UserRole, UserState } from '@domain/user/user.enum';
import { AccountCategory } from '@domain/account/account.enum';
import {
  PageRequestParams,
  PageResponseDto,
} from '@root/src/common/dto/pagination.dto';
import { RestaurantReview } from '@domain/restaurant/controller/restaurant.controller';
import {
  CreateAdminTokenRequest,
  TokenDTO,
} from '@domain/account/dto/account.dto';
import { createAdminToken } from '@domain/account/service/account.service';
import { IsOptional, IsString, IsEnum, Matches } from 'class-validator';
import { IsValidDateFormat } from '@common/validators/date.validator';

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

export interface AdminUserListResponse {
  users: UserWithExtendedAccount[];
  total: number;
}

export class AdminUserQueryParams extends PageRequestParams {
  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9가-힣\s@._-]*$/, {
    message: '검색어는 영문, 숫자, 한글, 공백, 특수문자(@._-)만 허용됩니다.',
  })
  search?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9가-힣\s]*$/, {
    message: '닉네임은 영문, 숫자, 한글, 공백만 허용됩니다.',
  })
  nickname?: string;

  @IsOptional()
  @IsString()
  @Matches(/^[a-zA-Z0-9@._-]*$/, {
    message: '아이디는 영문, 숫자, 특수문자(@._-)만 허용됩니다.',
  })
  identification?: string;

  @IsOptional()
  @IsValidDateFormat({
    message: '가입일은 유효한 YYYY-MM-DD 형식이어야 합니다. (예: 2025-01-15)',
  })
  createdAt?: string;

  @IsOptional()
  @IsEnum(UserState)
  state?: UserState;
}

@Controller('v1/admin')
@UseFilters(new HttpExceptionFilter())
@Injectable()
export class AdminController {
  /**
   * @tag admin
   * @summary create token for admin
   * @security bearer
   */
  @TypedRoute.Post('/tokens')
  @HttpCode(200)
  async createToken(
    @TypedBody() dto: CreateAdminTokenRequest,
  ): Promise<BaseResponseDto<TokenDTO>> {
    const token = await createAdminToken(dto);
    return new BaseResponseDto({ ...token });
  }

  /**
   * @tag admin
   * @summary 모든 회원 조회 (관리자 전용)
   * @security bearer
   */
  @UseGuards(AuthGuard, RolesGuard)
  @RequireAdmin()
  @HttpCode(200)
  @TypedRoute.Get('/users')
  async getAllUsers(
    @Query() query: AdminUserQueryParams,
  ): Promise<BaseResponseDto<AdminUserListResponse>> {
    const result = await getAllUsers({
      search: query.search,
      nickname: query.nickname,
      identification: query.identification,
      createdAt: query.createdAt,
      state: query.state,

      page: query.page,
      limit: query.limit,
    });

    return new BaseResponseDto({
      users: result.users,
      total: result.total,
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
