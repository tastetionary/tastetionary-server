import { Module } from '@nestjs/common';
import { ConfigurationService } from '@src/configuration/configuration.service';
import { ConfigurationController } from '@src/configuration/configuration.controller';

@Module({
  controllers: [ConfigurationController],
  providers: [ConfigurationService],
})
export class ConfigurationModule {}
