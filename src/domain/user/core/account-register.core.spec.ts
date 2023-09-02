import { AccountRegister } from '@src/domain/user/core/account-register.core';

describe('account-register', () => {
  it('should return', () => {
    const user = new AccountRegister();
    expect(user.helloWorld()).toEqual('hello');
  });
});
