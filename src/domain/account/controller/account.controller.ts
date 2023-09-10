import { Controller, HttpCode, Injectable, UseFilters } from '@nestjs/common';
import { HttpExceptionFilter } from '@common/exception/exception.filter';
import { TypedBody, TypedRoute } from '@nestia/core';
import { BaseResponseDto } from '@common/dto/base.dto';
import { AccountService } from '@domain/account/service/account.service';
import { AccountDTO } from '@domain/account/dto/account.dto';

@Controller('v1/account')
@UseFilters(new HttpExceptionFilter())
@Injectable()
export class AccountController {
  constructor(private service: AccountService) {}

  @TypedRoute.Post('/tokens')
  @HttpCode(200)
  async createToken(
    @TypedBody() dto: AccountDTO,
  ): Promise<BaseResponseDto<object>> {
    const token = await this.service.createToken(dto);
    return new BaseResponseDto({ ...token });
  }

  @TypedRoute.Delete('/tokens')
  @HttpCode(200)
  async deleteToken(): Promise<BaseResponseDto<object>> {
    return new BaseResponseDto({ state: 'success' });
  }
}
