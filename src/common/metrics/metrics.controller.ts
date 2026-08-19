import { Controller, Get, Query, UseFilters, UseGuards } from '@nestjs/common';
import { HttpExceptionFilter } from '@common/exception/exception.filter';
import { MetricsTokenGuard } from '@common/metrics/metrics.guard';
import {
  METRIC_RETENTION_DAYS,
  RecommendationMetrics,
  getRecommendationMetrics,
} from '@common/metrics/metrics.operations';

const DEFAULT_DAYS = 30;

function parseDays(days?: string): number {
  const parsed = Number(days);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return DEFAULT_DAYS;
  }

  return Math.min(parsed, METRIC_RETENTION_DAYS);
}

@Controller('metrics')
@UseFilters(new HttpExceptionFilter())
@UseGuards(MetricsTokenGuard)
export class MetricsController {
  /**
   * @internal
   */
  @Get()
  async getMetrics(
    @Query('days') days?: string,
  ): Promise<RecommendationMetrics> {
    return getRecommendationMetrics(parseDays(days));
  }
}
