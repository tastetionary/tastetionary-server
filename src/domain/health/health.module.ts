import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { RedisModule } from '@common/redis/redis.module';
import { HealthController } from '@domain/health/controller/health.controller';
import { PrismaHealthIndicator } from '@domain/health/indicator/prisma.health.indicator';
import { RedisHealthIndicator } from '@domain/health/indicator/redis.health.indicator';

@Module({
  imports: [TerminusModule, RedisModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator, RedisHealthIndicator],
})
export class HealthModule {}
