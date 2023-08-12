import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggingModule } from '@src/common/logging/logging.module';
import { ConfigurationModule } from '@src/configuration/configuration.module';
import { PlaygroundModule } from '@src/domain/playground/playground.module';
import { validate } from '@src/env.validation';
@Module({
  imports: [
    ConfigurationModule,
    PlaygroundModule,
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
      validate,
    }),
    LoggingModule,
  ],
})
export class AppModule {}
