import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import { HttpExceptionFilter } from '@src/common/exception/exception.filter';
import { TypedBody, TypedRoute } from '@nestia/core';
interface TestDto {
  /**
   * @format email
   */
  email: string;
}

@Controller('v1/playground')
@UseFilters(new HttpExceptionFilter())
export class PlaygroundController {
  @Get()
  findAll() {
    return 'Hello World!';
  }

  @Get('/error')
  createError() {
    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN, {
      cause: 'reason why throw error',
      description: 'hint how to resolve this error',
    });
  }

  @TypedRoute.Post('/nestia')
  getSampleNestia(@TypedBody() dto: TestDto): string {
    console.log(`work..., ${dto}`);
    return 'success';
  }
}
