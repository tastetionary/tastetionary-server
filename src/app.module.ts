import { RedisModule } from '@common/redis/redis.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggingModule } from '@src/common/logging/logging.module';
import { ConfigurationModule } from '@domain/configuration/configuration.module';
import { validate } from '@src/env.validation';
import { UserModule } from '@domain/user/user.module';
import { RestaurantModule } from '@domain/restaurant/restaurant.module';
import { FoodModule } from '@domain/food/food.module';
import { AuthenticationModule } from '@domain/authentication/authentication.module';
import { HealthModule } from '@domain/health/health.module';
import { DatabaseModule } from '@common/database/database.module';

@Module({
  imports: [
    ConfigurationModule,
    UserModule,
    RestaurantModule,
    FoodModule,
    AuthenticationModule,
    HealthModule,
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.NODE_ENV === 'production',
      cache: true,
      isGlobal: true,
      validate,
    }),
    LoggingModule,
    RedisModule,
    DatabaseModule,
  ],
})
export class AppModule {}
