import { Controller, HttpCode, Injectable, UseFilters } from '@nestjs/common';
import { HttpExceptionFilter } from '@common/exception/exception.filter';
import { TypedBody, TypedRoute } from '@nestia/core';
import { BaseResponseDto } from '@common/dto/base.dto';
import {
  CreateAuthenticationRequest,
  CreateAuthenticationResponse,
} from '@domain/authentication/dto/authentication.dto';

@Controller('v1/authentication')
@UseFilters(new HttpExceptionFilter())
@Injectable()
export class AuthenticationController {
  constructor() {}

  /**
   * @tag authentication
   * @summary create authentication progress, return progress id
   * @security bearer
   */
  @TypedRoute.Post('/')
  @HttpCode(200)
  async createAuthentication(
    @TypedBody() dto: CreateAuthenticationRequest,
  ): Promise<BaseResponseDto<CreateAuthenticationResponse>> {
    console.log(dto);
    return new BaseResponseDto({ id: '1' });
  }
}
