import { Module } from '@nestjs/common';
import { MetricsController } from '@common/metrics/metrics.controller';
import { MetricsTokenGuard } from '@common/metrics/metrics.guard';
import { ConfigurationService } from '@domain/configuration/configuration.service';

@Module({
  controllers: [MetricsController],
  providers: [ConfigurationService, MetricsTokenGuard],
})
export class MetricsModule {}
