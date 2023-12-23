import {
  Controller,
  HttpCode,
  Injectable,
  UseFilters,
  Param,
} from '@nestjs/common';
import { HttpExceptionFilter } from '@common/exception/exception.filter';
import { TypedBody, TypedRoute } from '@nestia/core';
import { BaseResponseDto } from '@common/dto/base.dto';
import {
  CreateAuthenticationResponse,
  DoneProgressRequest,
  DoneAuthenticationResponse,
  CreateProgressRequest,
} from '@domain/authentication/dto/authentication.dto';
import { AuthenticationCategory } from '@domain/authentication/authentication.enum';
import {
  beginAuthProgress,
  finishAuthProgress,
} from '@domain/authentication/facade/authentication.facade';

@Controller('v1/authentication')
@UseFilters(new HttpExceptionFilter())
@Injectable()
export class AuthenticationController {
  /**
   * @tag authentication
   * @summary create authentication in progress, return progress id, it need when check. it can be used for account, company
   */
  @TypedRoute.Post('/:category')
  @HttpCode(200)
  async createProgressAboutAccount(
    @Param('category') category: AuthenticationCategory,
    @TypedBody() dto: CreateProgressRequest,
  ): Promise<BaseResponseDto<CreateAuthenticationResponse>> {
    // TODO add limit logic
    const res = await beginAuthProgress({
      identification: dto.identification,
      category,
      type: dto.type,
    });

    return new BaseResponseDto(res);
  }

  /**
   * @tag authentication
   * @summary done in progress authentication, return id will be uses
   */
  @TypedRoute.Post('/status/done')
  @HttpCode(200)
  async doneProgress(
    @TypedBody() dto: DoneProgressRequest,
  ): Promise<BaseResponseDto<DoneAuthenticationResponse>> {
    const { id: authenticationId } = await finishAuthProgress(
      dto.historyId,
      dto.code,
    );
    return new BaseResponseDto({ authenticationId });
  }
}
