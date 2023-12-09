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
import {
  changeArea,
  getUser,
  registerUser,
} from '@domain/user/service/user.service';

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
    await registerUser(dto);
    return new BaseResponseDto({ state: 'success' });
  }

  /**
   * @tag user
   * @summary get profile
   */
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @TypedRoute.Get('/')
  async getProfile(@Request() req): Promise<BaseResponseDto<ProfileResponse>> {
    const user = await getUser(req.user.userId);
    return new BaseResponseDto({
      id: user.id,
      nickname: user.nickname,
      activity_area: user.activityArea ?? {},
      dining_area: user.dinningArea ?? {},
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
}
