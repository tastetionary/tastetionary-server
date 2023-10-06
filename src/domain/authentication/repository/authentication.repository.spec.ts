import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { PrismaService } from '@common/database/prisma.service';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { TestingModule } from '@nestjs/testing';
import { AuthenticationRepository } from '@domain/authentication/repository/authentication.repository';

describe('authentication', () => {
  let repo: AuthenticationRepository;
  let prisma: PrismaService;
  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [ConfigurationService, PrismaService, AuthenticationRepository],
    )) as TestingModule;
    repo = module.get(AuthenticationRepository);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma, ['authentications']);
  });

  it('should save data ', async () => {
    const data = {
      userId: 1,
      identification: 'identification',
      category: 'category',
      type: 'type',
      state: 'state',
    };
    await repo.saveAuthentication(data);
    const res = await repo.getAuthenticationByUserId(data.userId);
    expect(res.length).toEqual(1);
  });
});
