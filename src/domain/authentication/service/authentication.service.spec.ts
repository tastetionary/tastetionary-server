import { truncateTables } from '@root/jest.setup';
import {
  createProgressAuthentication,
  changeAuthenticationAsDone,
  resetNotRegisteredUserAuth,
  _private,
  findValidAuth,
  resetRegisteredUserAuth,
  syncAuthentication,
  getAuthentication,
} from '@domain/authentication/service/authentication.service';
import {
  AuthenticationCategory,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
import {
  AuthenticationHistoryRecord,
  getHistoryById,
} from '@domain/authentication/repository/authentication.repository';
import prismaClient from '@common/database/prisma';
import {
  CallerWrongDomainRuleException,
  InternalDomainException,
} from '@common/exception/internal.exception';

describe('authentication service', () => {
  beforeEach(async () => {
    await truncateTables(prismaClient, [
      'authentications',
      'authentication_histories',
    ]);
  });
  describe('private', () => {
    it('should return data', async () => {
      const userId = 999;
      const code = '1'.repeat(6);
      const data = {
        userId,
        category: AuthenticationCategory.COMPANY,
        identification: 'some@crud.com',
        code,
        type: AuthenticationType.EMAIL,
      };
      const auth = await createProgressAuthentication(data);

      const res = await findValidAuth(auth.id, code);
      expect(res.id).not.toBeNull();
    });

    it('with no history, should return error', async () => {
      expect(findValidAuth(191919, '123')).rejects.toThrowError(
        InternalDomainException,
      );
    });
  });

  describe('resetRegisteredUserAuth', () => {
    it('with not correct user should throw error', async () => {
      const data = {
        category: AuthenticationCategory.COMPANY,
        identification: 'some@crud.com',
        code: '1',
        type: AuthenticationType.EMAIL,
      };
      const res = await createProgressAuthentication(data);

      const history = (await getHistoryById(
        res.id,
      )) as AuthenticationHistoryRecord;
      const auth = await changeAuthenticationAsDone(history.id, history.code);
      const userId = 456;
      await syncAuthentication(userId, auth.id);

      await expect(
        resetRegisteredUserAuth(
          999,
          data.identification,
          data.category,
          data.type,
        ),
      ).rejects.toThrowError(CallerWrongDomainRuleException);
    });

    it('should delete registered user auth', async () => {
      const data = {
        category: AuthenticationCategory.COMPANY,
        identification: 'some@crud.com',
        code: '1',
        type: AuthenticationType.EMAIL,
      };
      const res = await createProgressAuthentication(data);

      const history = (await getHistoryById(
        res.id,
      )) as AuthenticationHistoryRecord;
      const auth = await changeAuthenticationAsDone(history.id, history.code);
      const userId = 123;
      await syncAuthentication(userId, auth.id);

      await resetRegisteredUserAuth(
        userId,
        data.identification,
        data.category,
        data.type,
      );

      const authRes = await getAuthentication(
        data.identification,
        data.category,
        data.type,
      );
      expect(authRes).toBeNull();
    });
  });

  describe('resetNotRegisteredUserAuth', () => {
    it('with password, should reset authentication', async () => {
      const data = {
        category: AuthenticationCategory.PASSWORD,
        identification: 'some@crud.com',
        code: '1',
        type: AuthenticationType.EMAIL,
      };
      await createProgressAuthentication(data);

      await resetNotRegisteredUserAuth(
        data.identification,
        data.category,
        data.type,
      );

      const res = await createProgressAuthentication(data);
      expect(res).not.toBeNull();
    });

    it('with company, should reset authentication', async () => {
      const userId = 999;
      const data = {
        userId,
        category: AuthenticationCategory.COMPANY,
        identification: 'some@crud.com',
        code: '1',
        type: AuthenticationType.EMAIL,
      };
      const res = await createProgressAuthentication(data);

      const history = (await getHistoryById(
        res.id,
      )) as AuthenticationHistoryRecord;

      await changeAuthenticationAsDone(history.id, history.code);

      let userAuth = await _private.getUserAuth(data);
      expect(userAuth.isDone(data.category, data.type)).toBe(true);

      await resetNotRegisteredUserAuth(
        data.identification,
        data.category,
        data.type,
      );

      userAuth = await _private.getUserAuth(data);
      expect(userAuth.isDone(data.category, data.type)).toBe(false);
    });
  });

  describe('createProgressAuthentication', () => {
    it('should create auth and history', async () => {
      const userId = 999;
      const data = {
        userId,
        category: AuthenticationCategory.COMPANY,
        identification: 'some@crud.com',
        code: '12345',
        type: AuthenticationType.EMAIL,
      };
      const res = await createProgressAuthentication(data);
      expect(res.id).not.toBeNull();

      const userAuth = await _private.getUserAuth(data);
      expect(userAuth.isInProgress(data.category, data.type)).toBe(true);
    });
  });

  describe('changeAuthenticationAsDone', () => {
    it('not history should raise error', async () => {
      await expect(
        changeAuthenticationAsDone(999, '1234'),
      ).rejects.toThrowError();
    });

    it('should update inProgress history to done', async () => {
      const userId = 999;
      const data = {
        userId,
        category: AuthenticationCategory.COMPANY,
        identification: 'some@crud.com',
        code: '1',
        type: AuthenticationType.EMAIL,
      };
      const res = await createProgressAuthentication(data);

      let userAuth = await _private.getUserAuth(data);
      expect(userAuth.isInProgress(data.category, data.type)).toBe(true);

      const history = (await getHistoryById(
        res.id,
      )) as AuthenticationHistoryRecord;

      await changeAuthenticationAsDone(history.id, history.code);

      userAuth = await _private.getUserAuth(data);
      expect(userAuth.isInProgress(data.category, data.type)).toBe(false);
    });
  });
});
