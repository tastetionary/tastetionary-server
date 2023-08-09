import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PlaygroundModule } from '@src/domain/playground/playground.module';
import { ConfigurationModule } from '@src/configuration/configuration.module';
@Module({
  imports: [
    ConfigurationModule,
    PlaygroundModule,
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
  ],
})
export class AppModule {}
