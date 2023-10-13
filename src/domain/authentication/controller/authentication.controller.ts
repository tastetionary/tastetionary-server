import {
  Controller,
  HttpCode,
  Injectable,
  UseFilters,
  UseGuards,
  Request,
} from '@nestjs/common';
import { HttpExceptionFilter } from '@common/exception/exception.filter';
import { TypedBody, TypedParam, TypedRoute } from '@nestia/core';
import { BaseResponseDto } from '@common/dto/base.dto';
import {
  CreateAuthenticationRequest,
  CreateAuthenticationResponse,
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
   * @security bearer
   */
  @UseGuards(AuthGuard)
  @TypedRoute.Post('/:category')
  @HttpCode(200)
  async createProgress(
    @Request() req,
    @TypedParam('category') category: AuthenticationCategory,
    @TypedBody() dto: CreateAuthenticationRequest,
  ): Promise<BaseResponseDto<CreateAuthenticationResponse>> {
    const res = await this.service.createProgressAuthentication({
      userId: req.user.userId,
      identification: dto.identification,
      category,
      type: dto.type,
    });
    return new BaseResponseDto(res);
  }
}
