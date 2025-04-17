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
import {
  ChangePasswordRequest,
  CreateTokenRequest,
  ResetPasswordRequest,
  TokenDTO,
} from '@domain/account/dto/account.dto';
import { AuthGuard } from '@common/auth/auth.guard';
import {
  changePassword,
  createToken,
  removeAllToken,
} from '@domain/account/service/account.service';
import { resetPassword } from '@domain/account/facade/account.facade';

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
    @TypedBody() dto: CreateTokenRequest,
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
    await removeAllToken(req.user.userId);
    return new BaseResponseDto({ state: 'success' });
  }

  /**
   * @tag account
   * @summary reset password, need authentication code and id and identification
   */
  @TypedRoute.Put('/password/reset')
  @HttpCode(200)
  async resetPassword(
    @TypedBody() req: ResetPasswordRequest,
  ): Promise<BaseResponseDto<object>> {
    await resetPassword(req.historyId, req.code);
    return new BaseResponseDto({ state: 'success' });
  }

  /**
   * @tag account
   * @summary update password, need new password, old password
   */
  @TypedRoute.Put('/password')
  @HttpCode(200)
  @UseGuards(AuthGuard)
  async updatePassword(
    @Request() req,
    @TypedBody() dto: ChangePasswordRequest,
  ): Promise<BaseResponseDto<object>> {
    const userId = req.user.userId;
    await changePassword(userId, dto.password);
    return new BaseResponseDto({ state: 'success' });
  }
}
