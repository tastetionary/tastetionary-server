import { TestingModule } from '@nestjs/testing';
import { appServiceFixture } from '@root/jest.setup';
import { ConfigurationService as cfgService } from '@src/configuration/configuration.service';

describe('configuration service', () => {
  beforeEach(async () => {});

  describe('get server config', () => {
    it.skip('reason: env is not cleared so this test affect other test, fixture with dev env should return expected', async () => {
      const module = (await appServiceFixture(
        [cfgService],
        'dev',
      )) as TestingModule;
      const service = module.get<cfgService>(cfgService);
      const res = service.getServerConfig();
      expect(res.env).toEqual('DEV');
    });

    it('fixture with test env should return expected', async () => {
      const module = (await appServiceFixture(
        [cfgService],
        'test',
      )) as TestingModule;
      const service = module.get<cfgService>(cfgService);
      const res = service.getServerConfig();
      expect(res.env).toEqual('TEST');
    });
  });
});
