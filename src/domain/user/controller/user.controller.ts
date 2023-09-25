import {
  Controller,
  HttpCode,
  Injectable,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { HttpExceptionFilter } from '@common/exception/exception.filter';
import { TypedBody, TypedRoute } from '@nestia/core';
import { RegisterUserDTO } from '@domain/user/dto/user.dto';
import { BaseResponseDto } from '@common/dto/base.dto';
import { UserRepository } from '@domain/user/repository/user.repository';
import { AuthGuard } from '@common/auth/auth.guard';

@Controller('v1/user')
@UseFilters(new HttpExceptionFilter())
@Injectable()
export class UserController {
  constructor(private repo: UserRepository) {}

  @HttpCode(200)
  @TypedRoute.Post('/')
  async registerAccount(
    @TypedBody() dto: RegisterUserDTO,
  ): Promise<BaseResponseDto<object>> {
    const data = await this.repo.tempMethod();
    console.log(data, dto);
    return new BaseResponseDto({ state: 'success' });
  }

  @UseGuards(AuthGuard)
  @TypedRoute.Get('/test')
  async test(): Promise<BaseResponseDto<object>> {
    return new BaseResponseDto({ state: 'success' });
  }
}
