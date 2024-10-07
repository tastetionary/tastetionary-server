import {
  Controller,
  HttpCode,
  Injectable,
  UseFilters,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { HttpExceptionFilter } from '@common/exception/exception.filter';
import { TypedBody, TypedRoute } from '@nestia/core';
import { BaseResponseDto } from '@common/dto/base.dto';
import {
  CreateAuthenticationResponse,
  DoneProgressRequest,
  DoneAuthenticationResponse,
  CreateProgressRequest,
  ReCreateProgressRequest,
} from '@domain/authentication/dto/authentication.dto';
import { AuthenticationCategory } from '@domain/authentication/authentication.enum';
import {
  beginAuthProgress,
  finishAuthProgress,
} from '@domain/authentication/facade/authentication.facade';
import { AuthGuard } from '@common/auth/auth.guard';

@Controller('v1/authentication')
@UseFilters(new HttpExceptionFilter())
@Injectable()
export class AuthenticationController {
  /**
   * @tag authentication
   * @summary [noToken] create authentication in progress, return progress id, it need when check. it can be used for account, company
   */
  @TypedRoute.Post('/public/:category')
  @HttpCode(200)
  async createProgressingAccount(
    @Param('category') category: AuthenticationCategory,
    @TypedBody() dto: CreateProgressRequest,
  ): Promise<BaseResponseDto<CreateAuthenticationResponse>> {
    // TODO add limit logic
    const res = await beginAuthProgress({
      identification: dto.identification,
      category: dto.category ?? category,
      type: dto.type,
    });

    return new BaseResponseDto(res);
  }

  /**
   * @tag authentication
   * @summary [noToken] done in progress authentication, return id will be used
   */
  @TypedRoute.Post('/public/status/done')
  @HttpCode(200)
  async doneProgress(
    @TypedBody() dto: DoneProgressRequest,
  ): Promise<BaseResponseDto<DoneAuthenticationResponse>> {
    const { id: authenticationId } = await finishAuthProgress({
      historyId: dto.historyId,
      code: dto.code,
    });
    return new BaseResponseDto({ authenticationId });
  }

  // /**
  //  * @tag authentication
  //  * @summary reCreate company authentication, it will delete company type auth if data exists
  //  */
  // @UseGuards(JwtAuthGuard)
  // @TypedRoute.Post('/company')
  // @HttpCode(200)
  // async reCreateCompanyAuthentication(
  //   @Request() req,
  //   @TypedBody() dto: ReCreateProgressRequest,
  // ): Promise<BaseResponseDto<CreateAuthenticationResponse>> {
  //   const res = await beginAuthProgress({
  //     userId: req.user.userId,
  //     identification: dto.identification,
  //     category: AuthenticationCategory.COMPANY,
  //     type: dto.type,
  //   });

  //   return new BaseResponseDto(res);
  // }

  /**
   * @tag authentication
   * @summary done in progress authentication and sync auth result to user
   */
  @UseGuards(AuthGuard)
  @TypedRoute.Post('/status/done')
  @HttpCode(200)
  async doneUserProgress(
    @Request() req,
    @TypedBody() dto: DoneProgressRequest,
  ): Promise<BaseResponseDto<DoneAuthenticationResponse>> {
    const { id: authenticationId } = await finishAuthProgress({
      historyId: dto.historyId,
      code: dto.code,
      userId: req.user.userId,
    });
    return new BaseResponseDto({ authenticationId });
  }
}
