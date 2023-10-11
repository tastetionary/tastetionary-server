import {
  AuthenticationCategory,
  AuthenticationState,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
import { UserAuth } from '@domain/authentication/core/user-auth';

describe('user auth', () => {
  it('isDone should return expected', () => {
    const data = {
      id: 1,
      userId: 1,
      identification: 'identification',
      type: AuthenticationType.EMAIL,
      category: AuthenticationCategory.COMPANY,
      state: AuthenticationState.INPROGRESS,
    };

    const user = new UserAuth(data.userId, [data]);
    expect(user.isDone(data.category, data.type)).toBe(false);
  });

  it('inInProgress should return expected', () => {
    const data = {
      id: 1,
      userId: 1,
      identification: 'identification',
      type: AuthenticationType.EMAIL,
      category: AuthenticationCategory.COMPANY,
      state: AuthenticationState.INPROGRESS,
    };

    const user = new UserAuth(data.userId, [data]);
    expect(user.isInProgress(data.category, data.type)).toBe(true);
  });
});
