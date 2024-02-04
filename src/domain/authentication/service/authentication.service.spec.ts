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
  validateDoneIdentification,
} from '@domain/authentication/service/authentication.service';
import {
  AuthenticationCategory,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
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

  describe('validateDoneIdentification', () => {
    it('with done, should return right', async () => {
      const userId = 123;
      const data = {
        userId,
        category: AuthenticationCategory.ACCOUNT,
        identification: 'some@crud.com',
        code: '1234',
        type: AuthenticationType.EMAIL,
      };
      const history = await createProgressAuthentication(data);
      const auth = await changeAuthenticationAsDone(history.id, '1234');

      const res = await validateDoneIdentification({
        authenticationId: auth.id,
        identification: data.identification,
        category: AuthenticationCategory.ACCOUNT,
        type: AuthenticationType.EMAIL,
      });
      expect(res.authenticationId).not.toBeNull();
    });

    it('with not done, should raise error', async () => {
      await expect(
        validateDoneIdentification({
          authenticationId: 1,
          identification: 'ide',
          category: AuthenticationCategory.ACCOUNT,
          type: AuthenticationType.EMAIL,
        }),
      ).rejects.toThrowError(CallerWrongDomainRuleException);
    });
  });

  describe('resetRegisteredUserAuth', () => {
    it('should delete registered user auth', async () => {
      const data = {
        category: AuthenticationCategory.COMPANY,
        identification: 'some@crud.com',
        code: '1',
        type: AuthenticationType.EMAIL,
      };
      const history = await createProgressAuthentication(data);
      const auth = await changeAuthenticationAsDone(history.id, data.code);

      const userId = 123;
      await syncAuthentication(userId, auth.id);

      await resetRegisteredUserAuth(userId, data.category, data.type);

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
      const history = await createProgressAuthentication(data);
      await changeAuthenticationAsDone(history.id, data.code);

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
      const history = await createProgressAuthentication(data);

      let userAuth = await _private.getUserAuth(data);
      expect(userAuth.isInProgress(data.category, data.type)).toBe(true);

      await changeAuthenticationAsDone(history.id, data.code);

      userAuth = await _private.getUserAuth(data);
      expect(userAuth.isInProgress(data.category, data.type)).toBe(false);
    });
  });
});
