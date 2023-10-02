import { Controller, HttpCode, Injectable, UseFilters } from '@nestjs/common';
import { HttpExceptionFilter } from '@common/exception/exception.filter';
import { TypedBody, TypedRoute } from '@nestia/core';
import { RegisterUserDTO } from '@domain/user/dto/user.dto';
import { BaseResponseDto } from '@common/dto/base.dto';
import { UserService } from '@domain/user/service/user.service';

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
}
