import { Controller, Get, UseFilters } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { HttpExceptionFilter } from '@common/exception/exception.filter';
import { PrismaHealthIndicator } from '@domain/health/indicator/prisma.health.indicator';
import { RedisHealthIndicator } from '@domain/health/indicator/redis.health.indicator';
import { TypedRoute } from '@nestia/core';

const MEMORY_HEAP_THRESHOLD = 300 * 1024 * 1024; // 300 MB

@Controller('health')
@UseFilters(new HttpExceptionFilter())
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaIndicator: PrismaHealthIndicator,
    private readonly redisIndicator: RedisHealthIndicator,
    private readonly memoryIndicator: MemoryHealthIndicator,
  ) {}

  /**
   * @tag health
   * @summary check server health (database, redis, memory)
   */
  @TypedRoute.Get('/healthz')
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.prismaIndicator.isHealthy('database'),
      () => this.redisIndicator.isHealthy('redis'),
      () => this.memoryIndicator.checkHeap('memory', MEMORY_HEAP_THRESHOLD),
    ]);
  }
}
