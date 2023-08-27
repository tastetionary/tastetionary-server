import { Module } from '@nestjs/common';
import { ConfigurationService } from '@root/src/domain/configuration/configuration.service';
import { V1ConfigurationController } from '@root/src/domain/configuration/configuration.controller';

@Module({
  controllers: [V1ConfigurationController],
  providers: [ConfigurationService],
})
export class ConfigurationModule {}
