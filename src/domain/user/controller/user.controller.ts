import {
  Controller,
  HttpCode,
  Injectable,
  UseFilters,
  UseGuards,
  Request,
  Param,
  Query,
} from '@nestjs/common';
import { HttpExceptionFilter } from '@common/exception/exception.filter';
import { TypedBody, TypedRoute, TypedException } from '@nestia/core';

import {
  AreaDto,
  PreferneceDto,
  ProfileResponse,
  RegisterProfileRequest,
  UpdateProfileRequestDto,
  WithdrawUserDto,
} from '@domain/user/dto/user.dto';
import { BaseResponseDto } from '@common/dto/base.dto';
import { AuthGuard } from '@common/auth/auth.guard';
import {
  changeArea,
  createPreferenceRestaurant,
  getPreferenceRestaurant,
  deleteUserPreferenceRestaurant,
  validateNickName,
  updateProfile,
} from '@domain/user/service/user.service';
import {
  getProfile,
  registerProfile,
  withdrawProfile,
} from '@domain/user/facade/user.facade';
import { PreferenceCategory } from '@domain/user/user.enum';
import { ExternalRestaurantInformationRecord } from '@domain/restaurant/repository/restaurant.repository';
import { BadRequestExceptionResponse } from '@root/src/common/exception/internal.exception';
import {
  ErrorCategoryEnum,
  ErrorSubCategoryEnum,
} from '@root/src/common/exception/enum';

export interface getPreferencesOutput
  extends Omit<
    ExternalRestaurantInformationRecord,
    | 'id'
    | 'externalUUID'
    | 'latitude'
    | 'longitude'
    | 'createdAt'
    | 'updatedAt'
    | 'distance'
    | 'referenceLink'
  > {
  id: string;
  externalUUID: string;
}

@Controller('v1/user')
@UseFilters(new HttpExceptionFilter())
@Injectable()
export class UserController {
  /**
   * @tag user
   * @summary register user
   */
  @HttpCode(200)
  @TypedRoute.Post('/')
  async registerAccount(
    @TypedBody() dto: RegisterProfileRequest,
  ): Promise<BaseResponseDto<object>> {
    await registerProfile(dto);
    return new BaseResponseDto({ state: 'success' });
  }

  /**
   * @tag user
   * @summary update user's profile info
   */
  @HttpCode(200)
  @TypedRoute.Put('/profile')
  @TypedException<BadRequestExceptionResponse>({
    status: 400,
    description: 'invalid nickname',
    examples: {
      'duplicate nickname': {
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: '/v1/user/nickname/validation',
        category: ErrorCategoryEnum.CALLER_WRONG_USAGE_ERROR,
        originMessage: 'duplicate nickname',
      },
      'invalid nickname': {
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: '/v1/user/nickname/validation',
        category: ErrorCategoryEnum.CALLER_WRONG_USAGE_ERROR,
        originMessage: 'invalid nickname',
      },
      'invalid nickname(range or forbidden characters)': {
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: '/v1/user/nickname/validation',
        category: ErrorCategoryEnum.CALLER_WRONG_USAGE_ERROR,
        originMessage:
          'only strings containing korean|english characters or numbers with lengths between 3 and 10 are allowed for nickname values',
      },
    },
  })
  async updateProfile(
    @Request() req,
    @TypedBody() dto: UpdateProfileRequestDto,
  ): Promise<BaseResponseDto<object>> {
    if (dto.nickname) await validateNickName(dto.nickname);
    await updateProfile(req.user.userId, dto);
    return new BaseResponseDto({ state: 'success' });
  }

  /**
   * @tag user
   * @summary 닉네임 체크
   */
  @HttpCode(200)
  @TypedRoute.Get('/nickname/validation')
  @TypedException<BadRequestExceptionResponse>({
    status: 400,
    description: 'invalid nickname',
    examples: {
      'duplicate nickname': {
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: '/v1/user/nickname/validation',
        category: ErrorCategoryEnum.CALLER_WRONG_USAGE_ERROR,
        originMessage: 'duplicate nickname',
      },
      'invalid nickname': {
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: '/v1/user/nickname/validation',
        category: ErrorCategoryEnum.CALLER_WRONG_USAGE_ERROR,
        originMessage: 'invalid nickname',
      },
      'invalid nickname(range or forbidden characters)': {
        statusCode: 400,
        timestamp: new Date().toISOString(),
        path: '/v1/user/nickname/validation',
        category: ErrorCategoryEnum.CALLER_WRONG_USAGE_ERROR,
        originMessage:
          'only strings containing korean|english characters or numbers with lengths between 3 and 10 are allowed for nickname values',
      },
    },
  })
  async validateNickName(
    @Query('name') nickname: string,
  ): Promise<BaseResponseDto<object>> {
    await validateNickName(nickname);
    return new BaseResponseDto({ state: 'success' });
  }

  /**
   * @tag user
   * @summary get profile
   */
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @TypedRoute.Get('/')
  async inquireMyPageProfile(
    @Request() req,
  ): Promise<BaseResponseDto<ProfileResponse>> {
    const profile = await getProfile(req.user.userId);
    return new BaseResponseDto({
      id: profile.user.id,
      nickname: profile.user.nickname,
      area: profile.area,
      account: {
        accountEmail: profile.account.identification,
      },
    });
  }

  /**
   * @tag user
   * @summary update user area
   */
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @TypedRoute.Put('/')
  async updateArea(
    @Request() req,
    @TypedBody() dto: AreaDto,
  ): Promise<BaseResponseDto<object>> {
    await changeArea(req.user.userId, dto);
    return new BaseResponseDto({ state: 'success' });
  }

  /**
   * @tag user
   * @summary withdraw user, delete account, token and update state
   */
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @TypedRoute.Delete('/')
  async withdrawUser(
    @Request() req,
    @TypedBody() dto: WithdrawUserDto,
  ): Promise<BaseResponseDto<object>> {
    await withdrawProfile(req.user.userId, dto.types);
    return new BaseResponseDto({ state: 'success' });
  }

  /**
   * @tag user
   * @summary get preferences
   */
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @TypedRoute.Get('preference/:category')
  async getPreference(
    @Param('category') category: PreferenceCategory,
    @Request() req,
  ): Promise<BaseResponseDto<getPreferencesOutput[]>> {
    const data = await getPreferenceRestaurant(req.user.userId, category);
    const result = data.map((item) => {
      return {
        id: item.id.toString(),
        externalUUID: item.external_uuid.toString(),
        name: item.name,
        address: item.address,
        phone: item.phone,
      };
    });

    return new BaseResponseDto(result);
  }

  /**
   * @tag user
   * @summary add preference restaurant
   */
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @TypedRoute.Post('/preference/:category')
  async registerPreference(
    @Param('category') category: PreferenceCategory,
    @TypedBody() dto: PreferneceDto,
    @Request() req,
  ): Promise<BaseResponseDto<object>> {
    await createPreferenceRestaurant(
      req.user.userId,
      dto.restaurantId,
      category,
    );
    return new BaseResponseDto({ state: 'success' });
  }

  /**
   * @tag user
   * @summary delete preference restaurant
   */
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @TypedRoute.Delete('preference/:category/:restaurantId')
  async deletePreference(
    @Param('category') category: PreferenceCategory,
    @Param('restaurantId') restaurantId: number,
    @Request() req,
  ): Promise<BaseResponseDto<object>> {
    await deleteUserPreferenceRestaurant(
      req.user.userId,
      Number(restaurantId),
      category,
    );
    return new BaseResponseDto({ state: 'success' });
  }
}
