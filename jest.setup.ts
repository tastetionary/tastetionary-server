import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '@src/app.service';

let appService:AppService;
beforeAll(async () => {
  const module: TestingModule = await Test.createTestingModule({
    providers: [AppService],
    imports: [
      ConfigModule.forRoot({
        cache: true,
        isGlobal: true,
        envFilePath: `.env.${process.env.NODE_ENV}`,
      }),
    ],
  }).compile();

  appService = module.get<AppService>(AppService);
});

export {appService};