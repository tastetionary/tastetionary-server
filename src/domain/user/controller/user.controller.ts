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
import {
  AreaDto,
  ProfileResponse,
  RegisterUserDTO,
} from '@domain/user/dto/user.dto';
import { BaseResponseDto } from '@common/dto/base.dto';
import { AuthGuard } from '@common/auth/auth.guard';
import { changeArea } from '@domain/user/service/user.service';
import { getProfile, registerProfile } from '@domain/user/facade/user.facade';

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
    @TypedBody() dto: RegisterUserDTO,
  ): Promise<BaseResponseDto<object>> {
    await registerProfile(dto);
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
    const res = new BaseResponseDto({
      id: profile.user.id,
      nickname: profile.user.nickname,
      area: {
        activity_area: profile.areas.activityArea ?? {},
        dining_area: profile.areas.diningArea ?? {},
      },
      account: {
        account_email: profile.authList.account.identification ?? '',
        company_email: profile.authList.company?.identification ?? '',
      },
    });

    return res;
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
}
