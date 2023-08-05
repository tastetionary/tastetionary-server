import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from '@src/app.service';
import { PlaygroundModule } from '@src/domain/playground/playground.module';
import config from '@src/config';
@Module({
  imports: [
    PlaygroundModule,
    ConfigModule.forRoot({
      cache: true,
      isGlobal: true,
      load: [config],
    }),
  ],
  providers: [AppService],
})
export class AppModule {}
