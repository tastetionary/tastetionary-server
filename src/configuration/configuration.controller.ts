import { Controller, Get } from '@nestjs/common';
import { ConfigurationService } from '@src/configuration/configuration.service';

@Controller('v1/configuration')
export class V1ConfigurationController {
  constructor(private readonly cfgService: ConfigurationService) {}

  @Get('/')
  getServerConfig() {
    return this.cfgService.getServerConfig();
  }

  @Get('/health-check')
  getServerStatus() {
    return this.cfgService.getServerMetaData();
  }
}
