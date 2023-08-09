import { Controller, Get } from '@nestjs/common';
import { AppService } from '@src/app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getEnv() {
    return this.appService.getEnv();
  }

  @Get('/health-check')
  healthCheck() {
    return {
      timestamp: new Date().toISOString(),
      version: 'v1',
    };
  }
}
