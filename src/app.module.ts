import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggingModule } from '@src/common/logging/logging.module';
import { ConfigurationModule } from '@domain/configuration/configuration.module';
import { validate } from '@src/env.validation';
import { UserModule } from '@domain/user/user.module';
import { RestaurantModule } from '@domain/restaurant/restaurant.module';
@Module({
  imports: [
    ConfigurationModule,
    UserModule,
    RestaurantModule,
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate,
    }),
    LoggingModule,
  ],
})
export class AppModule {}
