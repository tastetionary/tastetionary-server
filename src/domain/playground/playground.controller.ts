import { Controller, Get } from '@nestjs/common';

@Controller('v1/playground')
export class PlaygroundController {
  @Get()
  findAll() {
    return 'Hello World!gi';
  }
}
