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
import { AccountDTO, TokenDTO } from '@domain/account/dto/account.dto';
import { AuthGuard } from '@common/auth/auth.guard';
import {
  createToken,
  removeTokens,
} from '@domain/account/service/account.service';

@Controller('v1/account')
@UseFilters(new HttpExceptionFilter())
@Injectable()
export class AccountController {
  /**
   * @tag account
   * @summary create token for user
   * @security bearer
   */
  @TypedRoute.Post('/tokens')
  @HttpCode(200)
  async createToken(
    @TypedBody() dto: AccountDTO,
  ): Promise<BaseResponseDto<TokenDTO>> {
    const token = await createToken(dto);
    return new BaseResponseDto({ ...token });
  }

  /**
   * @tag account
   * @summary delete token,
   * @security bearer
   */
  @UseGuards(AuthGuard)
  @TypedRoute.Delete('/tokens')
  @HttpCode(200)
  async deleteToken(@Request() req): Promise<BaseResponseDto<object>> {
    await removeTokens(req.user.userId);
    return new BaseResponseDto({ state: 'success' });
  }
}
