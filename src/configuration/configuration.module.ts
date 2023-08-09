import { Module } from '@nestjs/common';
import { ConfigurationService } from '@src/configuration/configuration.service';
import { V1ConfigurationController } from '@src/configuration/configuration.controller';

@Module({
  controllers: [V1ConfigurationController],
  providers: [ConfigurationService],
})
export class ConfigurationModule {}
