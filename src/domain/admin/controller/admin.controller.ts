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
import { RolesGuard } from '@common/auth/roles.guard';
import { RequireAdmin } from '@common/auth/require-admin.decorator';
import {
  getAllRestaurantReviews,
  getAllReviewReports,
} from '@domain/restaurant/service/restaurant.service';
import { getAllUsers } from '@domain/user/service/user.service';
import { AreaDto, ProfileResponse } from '@domain/user/dto/user.dto';
import { AuthenticationCategory } from '@domain/authentication/authentication.enum';
import { UserRole } from '@domain/user/user.enum';
import { AccountCategory } from '../../account/account.enum';

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
  @TypedRoute.Get('/restaurant-reviews')
  async getAllRestaurantReviews(): Promise<BaseResponseDto<any>> {
    const reviews = await getAllRestaurantReviews();
    return new BaseResponseDto(reviews);
  }

  /**
   * @tag admin
   * @summary 모든 리뷰 신고 조회 (관리자 전용)
   * @security bearer
   */
  @UseGuards(AuthGuard, RolesGuard)
  @RequireAdmin()
  @HttpCode(200)
  @TypedRoute.Get('/review-reports')
  async getAllReviewReports(): Promise<BaseResponseDto<any>> {
    const reports = await getAllReviewReports();
    return new BaseResponseDto(reports);
  }
}
