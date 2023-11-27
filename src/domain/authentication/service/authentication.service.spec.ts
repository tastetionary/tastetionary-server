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
  AuthenticationHistoryRecord,
  getHistoryById,
} from '@domain/authentication/repository/authentication.repository';
import * as brevo from '@thirdParty/brevo/brevo';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { Environment } from '@root/src/env.validation';
import { CallerWrongDomainRuleException } from '@common/exception/internal.exception';

describe('authentication service', () => {
  let module: TestingModule;
  let service: AuthenticationService;
  let prisma: PrismaService;
  let cfgService: ConfigurationService;
  beforeAll(async () => {
    module = (await appModuleFixture(
      [],
      [],
      [AuthenticationModule],
    )) as TestingModule;
    service = module.get<AuthenticationService>(AuthenticationService);
    prisma = module.get(PrismaService);
    cfgService = module.get(ConfigurationService);
  });

  beforeEach(async () => {
    await truncateTables(prisma, [
      'authentications',
      'authentication_histories',
    ]);
  });

  describe('resetAuthentication', () => {
    const tempMock = jest.spyOn(brevo, 'sendEmail');
    tempMock.mockResolvedValue(Promise.resolve(true));

    it('should reset authentication', async () => {
      const userId = 999;
      const data = {
        userId,
        category: AuthenticationCategory.COMPANY,
        identification: 'some@crud.com',
        type: AuthenticationType.EMAIL,
      };
      const res = await service.createProgressAuthentication(data);

      const history = (await getHistoryById(
        res.id,
      )) as AuthenticationHistoryRecord;

      await service.doneProgressAuthentication(history.id, history.code);

      let userAuth = await service.getUserAuth(data);
      expect(userAuth.isDone(data.category, data.type)).toBe(true);

      await service.resetAuthentication(
        data.identification,
        data.category,
        data.type,
        userId,
      );

      userAuth = await service.getUserAuth(data);
      expect(userAuth.isDone(data.category, data.type)).toBe(false);
    });
  });

  describe('createProgressAuthentication', () => {
    const tempMock = jest.spyOn(brevo, 'sendEmail');
    tempMock.mockResolvedValue(Promise.resolve(true));

    it.each([['test'], ['daum'], ['naver'], ['gmail'], ['hanmail']])(
      'with not valid company domain should raise error',
      async (domain) => {
        const tempCfg = jest.spyOn(cfgService, 'getServerConfig');
        tempCfg.mockReturnValue({ env: Environment.PRODUCTION });
        const userId = 999;
        await expect(
          service.createProgressAuthentication({
            userId,
            category: AuthenticationCategory.COMPANY,
            identification: `some@${domain}.com`,
            type: AuthenticationType.EMAIL,
          }),
        ).rejects.toThrowError(CallerWrongDomainRuleException);
      },
    );

    it('duplicated should progress', async () => {
      const userId = 999;
      await service.createProgressAuthentication({
        userId,
        category: AuthenticationCategory.COMPANY,
        identification: 'some@crud.com',
        type: AuthenticationType.EMAIL,
      });

      const res = await service.createProgressAuthentication({
        userId,
        category: AuthenticationCategory.COMPANY,
        identification: 'some@crud.com',
        type: AuthenticationType.EMAIL,
      });

      const history = (await getHistoryById(
        res.id,
      )) as AuthenticationHistoryRecord;

      expect(history).toBeDefined();
    });

    it('already exist email should return code', async () => {
      const userId = 999;
      let res = await service.createProgressAuthentication({
        userId,
        category: AuthenticationCategory.COMPANY,
        identification: 'some@crud.com',
        type: AuthenticationType.EMAIL,
      });

      const history = (await getHistoryById(
        res.id,
      )) as AuthenticationHistoryRecord;

      await service.doneProgressAuthentication(history.id, history.code);

      res = await service.createProgressAuthentication({
        userId,
        category: AuthenticationCategory.COMPANY,
        identification: 'some@crud.com',
        type: AuthenticationType.EMAIL,
      });

      expect(res).toBeDefined();
    });

    it('should create auth history', async () => {
      const userId = 999;
      const data = {
        userId,
        category: AuthenticationCategory.COMPANY,
        identification: 'some@crud.com',
        type: AuthenticationType.EMAIL,
      };
      await service.createProgressAuthentication(data);
      const userAuth = await service.getUserAuth(data);
      expect(userAuth.isInProgress(data.category, data.type)).toBe(true);
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
      const data = {
        userId,
        category: AuthenticationCategory.COMPANY,
        identification: 'some@crud.com',
        type: AuthenticationType.EMAIL,
      };
      const res = await service.createProgressAuthentication(data);

      let userAuth = await service.getUserAuth(data);
      expect(userAuth.isInProgress(data.category, data.type)).toBe(true);

      const history = (await getHistoryById(
        res.id,
      )) as AuthenticationHistoryRecord;

      await service.doneProgressAuthentication(history.id, history.code);

      userAuth = await service.getUserAuth(data);
      expect(userAuth.isInProgress(data.category, data.type)).toBe(false);
    });
  });
});
