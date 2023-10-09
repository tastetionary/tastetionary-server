import { TestingModule } from '@nestjs/testing';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { PrismaService } from '@common/database/prisma.service';
import { AuthenticationModule } from '@domain/authentication/authentication.module';
import { AuthenticationService } from '@domain/authentication/service/authentication.service';
import {
  AuthenticationCategory,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
import {
  AuthenticationHistoryEntity,
  AuthenticationRepository,
} from '@domain/authentication/repository/authentication.repository';
import { ServiceException } from '@common/exception/custom.exception';

describe('authentication service', () => {
  let module: TestingModule;
  let service: AuthenticationService;
  let prisma: PrismaService;
  let repo: AuthenticationRepository;
  beforeAll(async () => {
    module = (await appModuleFixture(
      [],
      [],
      [AuthenticationModule],
    )) as TestingModule;
    service = module.get<AuthenticationService>(AuthenticationService);
    prisma = module.get(PrismaService);
    repo = module.get(AuthenticationRepository);
  });

  beforeEach(async () => {
    await truncateTables(prisma, [
      'authentications',
      'authentication_histories',
    ]);
  });

  describe('createProgressAuthentication', () => {
    it('already exist email should throw error', async () => {
      const userId = 999;
      const res = await service.createProgressAuthentication({
        userId,
        category: AuthenticationCategory.COMPANY,
        identification: 'some@test.com',
        type: AuthenticationType.EMAIL,
      });

      const history = (await repo.getHistoryById(
        res.id,
      )) as AuthenticationHistoryEntity;

      await service.doneProgressAuthentication(history.id, history.code);

      await expect(
        service.createProgressAuthentication({
          userId,
          category: AuthenticationCategory.COMPANY,
          identification: 'some@test.com',
          type: AuthenticationType.EMAIL,
        }),
      ).rejects.toThrowError(ServiceException);
    });

    it('should create auth history', async () => {
      const userId = 999;
      await service.createProgressAuthentication({
        userId,
        category: AuthenticationCategory.COMPANY,
        identification: 'some@test.com',
        type: AuthenticationType.EMAIL,
      });
      const userAuth = await service.getUserAuth(userId);
      expect(userAuth.isInProgress()).toBe(true);
    });
  });

  describe('doneProgressAuthentication', () => {
    it('not history should raise error', async () => {
      await expect(
        service.doneProgressAuthentication(999, '1234'),
      ).rejects.toThrowError();
    });

    it('should update inProgress history to done', async () => {
      const userId = 999;
      const res = await service.createProgressAuthentication({
        userId,
        category: AuthenticationCategory.COMPANY,
        identification: 'some@test.com',
        type: AuthenticationType.EMAIL,
      });

      let userAuth = await service.getUserAuth(userId);
      expect(userAuth.isInProgress()).toBe(true);

      const history = (await repo.getHistoryById(
        res.id,
      )) as AuthenticationHistoryEntity;

      await service.doneProgressAuthentication(history.id, history.code);

      userAuth = await service.getUserAuth(userId);
      expect(userAuth.isInProgress()).toBe(false);
    });
  });
});
