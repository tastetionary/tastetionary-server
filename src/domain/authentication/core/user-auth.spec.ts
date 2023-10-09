import {
  AuthenticationCategory,
  AuthenticationState,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
import { UserAuth } from '@domain/authentication/core/user-auth';

describe('user auth', () => {
  it('should return expected', () => {
    const data = {
      id: 1,
      userId: 1,
      identification: 'identification',
      type: AuthenticationType.EMAIL,
      category: AuthenticationCategory.COMPANY,
      state: AuthenticationState.INPROGRESS,
    };

    const history = new UserAuth(data.userId, [data]);
    expect(history.isInProgress()).toBe(true);
  });
});
