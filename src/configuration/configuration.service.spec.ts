import { TestingModule } from '@nestjs/testing';
import { appServiceFixture } from '@root/jest.setup';
import { ConfigurationService as cfgService } from '@src/configuration/configuration.service';

describe('configuration service', () => {
  let service: cfgService;
  beforeAll(async () => {
    const module = (await appServiceFixture(
      [cfgService],
      'test',
    )) as TestingModule;
    service = module.get<cfgService>(cfgService);
  });

  it('should return meta property', () => {
    const meta = service.getServerMetaData();
    expect(meta).toHaveProperty('serverTime');
    expect(meta).toHaveProperty('version');
  });

  it('fixture with test env should return expected', async () => {
    const res = service.getServerConfig();
    expect(res.ENV).toEqual('test');
  });

  it.skip('reason: env is not cleared so this test affect other test, fixture with dev env should return expected', async () => {
    const module = (await appServiceFixture(
      [cfgService],
      'dev',
    )) as TestingModule;
    const devService = module.get<cfgService>(cfgService);
    const res = devService.getServerConfig();
    expect(res.ENV).toEqual('development');
  });
});
