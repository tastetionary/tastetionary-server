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
import { AccountService } from '@domain/account/service/account.service';
import { AccountDTO, TokenDTO } from '@domain/account/dto/account.dto';
import { AuthGuard } from '@common/auth/auth.guard';

@Controller('v1/account')
@UseFilters(new HttpExceptionFilter())
@Injectable()
export class AccountController {
  constructor(private service: AccountService) {}

  @TypedRoute.Post('/tokens')
  @HttpCode(200)
  async createToken(
    @TypedBody() dto: AccountDTO,
  ): Promise<BaseResponseDto<TokenDTO>> {
    const token = await this.service.createToken(dto);
    return new BaseResponseDto({ ...token });
  }

  @UseGuards(AuthGuard)
  @TypedRoute.Delete('/tokens')
  @HttpCode(200)
  async deleteToken(@Request() req): Promise<BaseResponseDto<object>> {
    await this.service.deleteTokens(req.user.userId);
    return new BaseResponseDto({ state: 'success' });
  }
}
