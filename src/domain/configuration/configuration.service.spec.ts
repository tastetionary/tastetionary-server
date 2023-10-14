import { TestingModule } from '@nestjs/testing';
import { appServiceFixture } from '@root/jest.setup';
import { ConfigurationService as cfgService } from '@domain/configuration/configuration.service';

describe('configuration service', () => {
  let service: cfgService;
  beforeAll(async () => {
    const module = (await appServiceFixture([cfgService])) as TestingModule;
    service = module.get<cfgService>(cfgService);
  });

  it('should return mail env', () => {
    const data = service.getMailGunConfig();
    expect(data).not.toBeNull();
  });

  it('should return meta property', () => {
    const meta = service.getServerMetaData();
    expect(meta).toHaveProperty('serverTime');
    expect(meta).toHaveProperty('version');
  });

  it('should return expected', async () => {
    const res = service.getServerConfig();
    expect(res).toHaveProperty('ENV');
  });
});
