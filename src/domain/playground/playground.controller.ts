import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import { HttpExceptionFilter } from '@src/common/exception/exception.filter';
import { TypedBody, TypedParam, TypedRoute } from '@nestia/core';
export interface TestDto {
  /**
   * Title of the article.
   */
  title: string;

  /**
   * Content body.
   */
  body: string;

  /**
   * Password of the article.
   */
  password: string;
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

  @TypedRoute.Get('/nestia/:value')
  getSampleNestiaTwo(@TypedParam('value') value: string): string {
    console.log(`work..., ${value}`);
    return 'success';
  }
}
