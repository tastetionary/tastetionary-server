import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggingModule } from '@src/common/logging/logging.module';
import { ConfigurationModule } from '@domain/configuration/configuration.module';
import { validate } from '@src/env.validation';
import { UserModule } from '@domain/user/user.module';
import { FoodModule } from '@domain/food/food.module';
@Module({
  imports: [
    ConfigurationModule,
    UserModule,
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      validate,
    }),
    LoggingModule,
    FoodModule,
  ],
})
export class AppModule {}
