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
    await truncateTables(prisma, [
      'authentications',
      'authentication_histories',
    ]);
  });

  it('should update authentication', async () => {
    const data = {
      userId: 1,
      identification: 'identification',
      category: 'category',
      type: 'type',
      state: 'inProgress',
    };
    await repo.saveAuthentication(data);

    let res = await repo.getAuthenticationByUserId(data.userId);
    await repo.updateAuthentication({ id: res[0].id, state: 'done' });

    res = await repo.getAuthenticationByUserId(data.userId);
    expect(res[0].state).toEqual('done');
  });

  it('should create authentication history ', async () => {
    const data = {
      userId: 1,
      identification: 'identification',
      type: 'type',
      code: '123',
      expiredAt: new Date(),
    };
    await repo.saveAuthenticationHistory(data);
    const res = await repo.getAuthenticationHistoryByUserId(
      data.userId,
      data.type,
    );
    expect(res.length).toEqual(1);
  });

  it('should create authentication ', async () => {
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
