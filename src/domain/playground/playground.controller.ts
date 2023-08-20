import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import { HttpExceptionFilter } from '@src/common/exception/exception.filter';
import { TypedBody, TypedRoute } from '@nestia/core';
import { PlaygroundSampleDto } from '@domain/playground/dto/playground.dto';

@Controller('v1/playground')
@UseFilters(new HttpExceptionFilter())
export class PlaygroundController {
  // TODO delete after fixing custom error rule
  @Get('/error')
  createError() {
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN, {
      cause: 'reason why throw error',
      description: 'hint how to resolve this error',
    });
  }

  @TypedRoute.Post('/nestia')
  postSample(@TypedBody() dto: PlaygroundSampleDto): PlaygroundSampleDto {
    return dto;
  }
}
