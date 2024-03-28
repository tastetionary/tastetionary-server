import {
  AuthenticationCategory,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
import {
  createProgressAuthentication,
  getAuthentication,
} from '@domain/authentication/service/authentication.service';
import { AccountCategory } from '@domain/account/account.enum';
import {
  createAccount,
  createToken,
} from '@domain/account/service/account.service';
import { resetPassword } from '@domain/account/facade/account.facade';
import { truncateTables } from '@root/jest.setup';
import prismaClient from '@common/database/prisma';

describe('facade', () => {
  describe('resetPassword', () => {
    beforeEach(async () => {
      await truncateTables(prismaClient, [
        'accounts',
        'authentications',
        'authentication_histories',
      ]);
    });

    it('should change password and delete auth for history', async () => {
      const userId = 666;
      const identification = 'some@crud.com';
      const dto = {
        identification,
        password: 'pwd',
        category: AccountCategory.EMAIL,
      };
      await createAccount({
        userId,
        ...dto,
      });

      const code = '1'.repeat(6);

      const data = {
        userId,
        category: AuthenticationCategory.PASSWORD,
        code,
        identification,
        type: AuthenticationType.EMAIL,
      };
      const history = await createProgressAuthentication(data);

      const newPassword = await resetPassword(history.id, code);

      const token = await createToken({
        identification: dto.identification,
        password: newPassword,
        category: dto.category,
      });

      expect(token).not.toBeNull();
      const auth = await getAuthentication(
        identification,
        AuthenticationCategory.PASSWORD,
        AuthenticationType.EMAIL,
      );

      expect(auth).toBeNull();
    });
  });
});
