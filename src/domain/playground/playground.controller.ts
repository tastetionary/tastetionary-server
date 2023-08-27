import { Controller, Get, UseFilters } from '@nestjs/common';
import { HttpExceptionFilter } from '@src/common/exception/exception.filter';
import { TypedBody, TypedRoute } from '@nestia/core';
import { PlaygroundSampleDto } from '@domain/playground/dto/playground.dto';
import { PlaygroundService } from './service/playground.service';

@Controller('v1/playground')
@UseFilters(new HttpExceptionFilter())
export class PlaygroundController {
  constructor(private service: PlaygroundService) {}
  // TODO delete after fixing custom error rule
  @Get('/error')
  createError() {
    return this.service.get(1);
  }

  @TypedRoute.Post('/nestia')
  postSample(@TypedBody() dto: PlaygroundSampleDto): PlaygroundSampleDto {
    return dto;
  }
}
