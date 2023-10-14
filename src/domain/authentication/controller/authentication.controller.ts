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
  CreateProgressRequest,
  CreateAuthenticationResponse,
  DoneProgressRequest,
} from '@domain/authentication/dto/authentication.dto';
import { AuthenticationService } from '@domain/authentication/service/authentication.service';
import { AuthenticationCategory } from '@domain/authentication/authentication.enum';
import { AuthGuard } from '@common/auth/auth.guard';

@Controller('v1/authentication')
@UseFilters(new HttpExceptionFilter())
@Injectable()
export class AuthenticationController {
  constructor(private readonly service: AuthenticationService) {}

  /**
   * @tag authentication
   * @summary create authentication in progress, return progress id, it need when check
   */
  @TypedRoute.Post('/account')
  @HttpCode(200)
  async createProgressAboutAccount(
    @TypedBody() dto: CreateProgressRequest,
  ): Promise<BaseResponseDto<CreateAuthenticationResponse>> {
    // TODO add limit logic
    const res = await this.service.createProgressAuthentication({
      identification: dto.identification,
      category: AuthenticationCategory.ACCOUNT,
      type: dto.type,
    });
    return new BaseResponseDto(res);
  }

  /**
   * @tag authentication
   * @summary create company authentication in progress, return progress id, it need when check
   * @security bearer
   */
  @UseGuards(AuthGuard)
  @TypedRoute.Post('/company')
  @HttpCode(200)
  async createProgressAboutCompany(
    @Request() req,
    @TypedBody() dto: CreateProgressRequest,
  ): Promise<BaseResponseDto<CreateAuthenticationResponse>> {
    const res = await this.service.createProgressAuthentication({
      userId: req.user.userId,
      identification: dto.identification,
      category: AuthenticationCategory.COMPANY,
      type: dto.type,
    });
    return new BaseResponseDto(res);
  }

  /**
   * @tag authentication
   * @summary done in progress authentication
   * @security bearer
   */
  @UseGuards(AuthGuard)
  @TypedRoute.Post('/status/done')
  @HttpCode(200)
  async doneProgress(@Request() req, @TypedBody() dto: DoneProgressRequest) {
    await this.service.doneProgressAuthentication(dto.historyId, dto.code);
    return new BaseResponseDto(null);
  }
}
