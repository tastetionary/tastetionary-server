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
  CreateAccountRequest,
  CreateTokenRequest,
  ResetPasswordRequest,
  SocialTokenDTO,
  SocialTokenRequest,
  TokenDTO,
} from '@domain/account/dto/account.dto';
import { AuthGuard } from '@common/auth/auth.guard';
import {
  createToken,
  findAccount,
  removeAllToken,
} from '@domain/account/service/account.service';
import { resetPassword } from '@domain/account/facade/account.facade';
import { AccountCategory } from '../account.enum';
import { getKakaoUserInfo } from '@root/src/third-party/kakao/kakao';

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

  @TypedRoute.Post('/kakao')
  @HttpCode(200)
  async kakaoLogin(
    @TypedBody() dto: SocialTokenRequest,
  ): Promise<BaseResponseDto<SocialTokenDTO>> {
    const kakaoUserInfo = await getKakaoUserInfo(dto.code);
    const user = await findAccount(kakaoUserInfo.id, AccountCategory.KAKAO);

    if (!user) {
      return new BaseResponseDto({ state: 'register' });
    }

    const token = await createToken({
      identification: user.identification,
      category: user.category,
      password: '',
    });
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
   * @summary update password, need authentication code and id and identification
   */
  @TypedRoute.Put('/password')
  @HttpCode(200)
  async resetPassword(
    @TypedBody() req: ResetPasswordRequest,
  ): Promise<BaseResponseDto<object>> {
    const newPassword = await resetPassword(req.historyId, req.code);
    return new BaseResponseDto({ state: 'success', password: newPassword });
  }
}
