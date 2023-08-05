import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from '@src/app.service';

describe('app service', () => {
  let appService: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
      imports: [ConfigModule],
    }).compile();

    appService = module.get<AppService>(AppService);
  });

  describe('configuration', () => {
    it('should temp', () => {
      const res = appService.getHello();
      console.log(res);
      expect(appService.getHello()).not.toBeNull();
    });
  });
});
