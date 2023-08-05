import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import { HttpExceptionFilter } from '@src/common/exception/exception.filter';

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
}
