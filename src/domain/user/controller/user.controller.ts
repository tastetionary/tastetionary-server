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
import { AreaDto, RegisterUserDTO } from '@domain/user/dto/user.dto';
import { BaseResponseDto } from '@common/dto/base.dto';
import { UserService } from '@domain/user/service/user.service';
import { AuthGuard } from '@common/auth/auth.guard';

@Controller('v1/user')
@UseFilters(new HttpExceptionFilter())
@Injectable()
export class UserController {
  constructor(private service: UserService) {}

  /**
   * @tag user
   * @summary register user
   */
  @HttpCode(200)
  @TypedRoute.Post('/')
  async registerAccount(
    @TypedBody() dto: RegisterUserDTO,
  ): Promise<BaseResponseDto<object>> {
    await this.service.register(dto);
    return new BaseResponseDto({ state: 'success' });
  }

  /**
   * @tag user
   * @summary get profile
   */
  @HttpCode(200)
  @UseGuards(AuthGuard)
  @TypedRoute.Get('/')
  async getProfile(@Request() req): Promise<BaseResponseDto<object>> {
    const user = await this.service.getEndUser(req.user.userId);
    return new BaseResponseDto(user);
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
    await this.service.updateArea(req.user.userId, dto);
    return new BaseResponseDto({ state: 'success' });
  }
}
