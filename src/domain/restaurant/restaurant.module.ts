import { Module } from '@nestjs/common';
import { RestaurantController } from '@domain/restaurant/controller/restaurant.controller';
import { AuthGuard } from '@common/auth/auth.guard';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from '@domain/user/user.module';
import { RedisModule } from '@common/redis/redis.module';
import { RateLimitGuard } from '@common/rate-limit/rate-limit.guard';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [UserModule, RedisModule],
  controllers: [RestaurantController],
  providers: [
    AuthGuard,
    ConfigurationService,
    JwtService,
    RateLimitGuard,
    Reflector,
  ],
})
export class RestaurantModule {}
