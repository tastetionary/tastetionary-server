import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggingModule } from '@src/common/logging/logging.module';
import { ConfigurationModule } from '@domain/configuration/configuration.module';
import { validate } from '@src/env.validation';
import { UserModule } from '@domain/user/user.module';
import { RestaurantModule } from '@domain/restaurant/restaurant.module';
import { FoodModule } from '@domain/food/food.module';
@Module({
  imports: [
    ConfigurationModule,
    UserModule,
    RestaurantModule,
    FoodModule,
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate,
    }),
    LoggingModule,
  ],
})
export class AppModule {}
