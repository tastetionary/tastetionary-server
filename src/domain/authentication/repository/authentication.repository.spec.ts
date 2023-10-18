import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { PrismaService } from '@common/database/prisma.service';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { TestingModule } from '@nestjs/testing';
import { AuthenticationRepository } from '@domain/authentication/repository/authentication.repository';
import {
  AuthenticationCategory,
  AuthenticationState,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';

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
      identification: 'identification',
      category: AuthenticationCategory.COMPANY,
      type: AuthenticationType.EMAIL,
      state: AuthenticationState.INPROGRESS,
    };
    const res = await repo.saveAuthentication(data);
    const userId = 1244;
    await repo.updateAuthentication({
      id: res.id,
      userId,
    });

    const records = await repo.getAuthenticationByUserId(userId);
    expect(records[0].id).toEqual(res.id);
  });

  it('should create authentication history ', async () => {
    const expiredAt = new Date();
    expiredAt.setSeconds(expiredAt.getSeconds() + 180);
    const data = {
      userId: 1,
      identification: 'identification',
      category: AuthenticationCategory.ACCOUNT,
      type: AuthenticationType.EMAIL,
      code: '123',
      expiredAt: expiredAt,
    };
    const history = await repo.saveAuthenticationHistory(data);
    const res = await repo.getHistoryById(history.id);
    expect(res).not.toBeNull();
    expect(res?.type).toEqual(data.type);
  });

  it('should create authentication ', async () => {
    const data = {
      userId: 1,
      identification: 'identification',
      category: AuthenticationCategory.COMPANY,
      type: AuthenticationType.EMAIL,
      state: AuthenticationState.INPROGRESS,
    };
    await repo.saveAuthentication(data);
    const res = await repo.getAuthenticationByUserId(data.userId);
    expect(res.length).toEqual(1);
  });
});
