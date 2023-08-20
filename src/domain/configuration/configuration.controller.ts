import { Controller } from '@nestjs/common';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { TypedRoute } from '@nestia/core';

@Controller('v1/configuration')
export class V1ConfigurationController {
  constructor(private readonly cfgService: ConfigurationService) {}

  @TypedRoute.Get('/')
  getServerConfig() {
    return this.cfgService.getServerConfig();
  }

  @TypedRoute.Get('/server-status')
  getServerStatus() {
    return this.cfgService.getServerMetaData();
  }
}
