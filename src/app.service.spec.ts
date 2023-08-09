import { TestingModule } from '@nestjs/testing';
import { appServiceFixture } from '@root/jest.setup';
import { AppService } from '@src/app.service';

describe('app service', () => {
  beforeEach(async () => {});

  describe('fixture', () => {
    it.skip('reason: env is not cleared so this test affect other test, fixture with dev env should return expected', async () => {
      const module = (await appServiceFixture(
        [AppService],
        'dev',
      )) as TestingModule;
      const appService = module.get<AppService>(AppService);
      const res = appService.getEnv();
      expect(res.env).toEqual('DEV');
    });

    it('fixture with test env should return expected', async () => {
      const module = (await appServiceFixture(
        [AppService],
        'test',
      )) as TestingModule;
      const appService = module.get<AppService>(AppService);
      const res = appService.getEnv();
      expect(res.env).toEqual('TEST');
    });
  });
});
