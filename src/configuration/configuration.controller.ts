import { Controller, Get } from '@nestjs/common';
import { ConfigurationService } from '@src/configuration/configuration.service';

@Controller('v1/configuration')
export class V1ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Get('/')
  get() {
    return '';
  }

  @Get('/health-check')
  getServerStatus() {
    return '';
  }
}
