import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlaygroundModule } from '@src/domain/playground/playground.module';
import { AppController } from '@src/app.controller';
import { ConfigurationModule } from './configuration/configuration.module';
@Module({
  controllers: [AppController],
  imports: [
    PlaygroundModule,
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
    ConfigurationModule,
  ],
})
export class AppModule {}
