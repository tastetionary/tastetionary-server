import { truncateTables } from '@root/jest.setup';
import prismaClient from '@root/src/common/database/prisma';
import { CallerWrongDomainRuleException } from '@root/src/common/exception/internal.exception';
import { EnvironmentEnum } from '@root/src/env.validation';
import * as brevo from '@thirdParty/brevo/brevo';
import {
  AuthenticationCategory,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
import {
  createProgressAuthentication,
  changeAuthenticationAsDone,
} from '@domain/authentication/service/authentication.service';
import { beginAuthProgress } from '@domain/authentication/facade/authentication.facade';

describe('facade', () => {
  describe('beginAuthProgress', () => {
    beforeEach(async () => {
      await truncateTables(prismaClient, [
        'authentications',
        'authentication_histories',
      ]);
    });

    const mockSendEmail = jest.spyOn(brevo, 'sendEmail');
    mockSendEmail.mockResolvedValue(Promise.resolve(true));

    // it.each([['test'], ['daum'], ['naver'], ['gmail'], ['hanmail']])(
    //   'with not valid company domain should raise error',
    //   async (domain) => {
    //     const userId = 999;
    //     await expect(
    //       beginAuthProgress({
    //         userId,
    //         category: AuthenticationCategory.ACCOUNT,
    //         identification: `some@${domain}.com`,
    //         type: AuthenticationType.EMAIL,
    //         env: EnvironmentEnum.PRODUCTION,
    //       }),
    //     ).rejects.toThrowError(CallerWrongDomainRuleException);
    //   },
    // );

    it('already exist email should reset and return code', async () => {
      const userId = 999;
      const mockCode = '0'.repeat(6);
      const res = await createProgressAuthentication({
        userId,
        category: AuthenticationCategory.ACCOUNT,
        identification: 'some@crud.com',
        code: mockCode,
        type: AuthenticationType.EMAIL,
      });

      await changeAuthenticationAsDone(res.id, mockCode);

      const afterRes = await beginAuthProgress({
        userId,
        category: AuthenticationCategory.ACCOUNT,
        identification: 'some@crud.com',
        type: AuthenticationType.EMAIL,
      });

      expect(afterRes).toHaveProperty('id');
      expect(afterRes).toHaveProperty('expiredAt');
    });

    it('should call sendEmail', async () => {
      const userId = 999;
      const data = {
        userId,
        category: AuthenticationCategory.ACCOUNT,
        identification: 'some@crud.com',
        type: AuthenticationType.EMAIL,
      };

      await beginAuthProgress(data);

      expect(mockSendEmail).toBeCalled();
    });
  });
});
