import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from '@src/app.service';
import { PlaygroundModule } from '@src/domain/playground/playground.module';
@Module({
  imports: [
    PlaygroundModule,
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV}`,
    }),
  ],
  providers: [AppService],
})
export class AppModule {}
