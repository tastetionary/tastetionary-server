import { Controller } from '@nestjs/common';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { TypedRoute } from '@nestia/core';

@Controller('v1/configuration')
export class V1ConfigurationController {
  constructor(private readonly cfgService: ConfigurationService) {}

  /**
   * @TODO add validation rule, only check for us
   * @tag configuration
   * @summary get server configuration
   */
  @TypedRoute.Get('/')
  getServerConfig() {
    return this.cfgService.getServerConfig();
  }

  /**
   * @tag configuration
   * @summary get server status
   */
  @TypedRoute.Get('/server-status')
  getServerStatus() {
    return this.cfgService.getServerMetaData();
  }
}
