import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlaygroundModule } from '@src/domain/playground/playground.module';
import { ConfigurationModule } from '@src/configuration/configuration.module';
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
  ],
})
export class AppModule {}
