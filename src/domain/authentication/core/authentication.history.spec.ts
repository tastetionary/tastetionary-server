import { AuthenticationType } from '@domain/authentication/authentication.enum';
import { UserAuth } from '@domain/authentication/core/authentication.history';

describe('authentication history', () => {
  it('should return expected', () => {
    const data = {
      id: 1,
      userId: 1,
      identification: 'identification',
      type: AuthenticationType.EMAIL,
      code: '12345',
      expiredAt: new Date(),
    };

    const history = new UserAuth(data.userId, [data]);
    expect(history.isInProgress()).toBe(false);
  });
});
