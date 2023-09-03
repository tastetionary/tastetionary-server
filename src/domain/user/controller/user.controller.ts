import { Controller, Injectable, UseFilters } from '@nestjs/common';
import { HttpExceptionFilter } from '@src/common/exception/exception.filter';
import { TypedBody, TypedRoute } from '@nestia/core';
import { RegisterAccountDto } from '@domain/user/dto/user.dto';
import { BaseResponseDto } from '@common/dto/base.dto';
import { UserRepository } from '@domain/user/repository/user.repository';

@Controller('v1/users')
@UseFilters(new HttpExceptionFilter())
@Injectable()
export class UserController {
  constructor(private repo: UserRepository) {}

  @TypedRoute.Post('/')
  async registerAccount(
    @TypedBody() dto: RegisterAccountDto,
  ): Promise<BaseResponseDto<{ state: string }>> {
    const data = await this.repo.tempMethod();
    console.log(data, dto);
    return new BaseResponseDto({ state: 'success' });
  }
}
